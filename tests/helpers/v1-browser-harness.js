const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..", "..");
const SCRIPT_FILES = [
  "legacy-v1/js/core.js",
  "legacy-v1/js/note-formatters.js",
  "legacy-v1/js/procedures.js",
  "legacy-v1/js/app.js",
];

class HTMLElement {}

function createFakeApp({
  values = {},
  radios = {},
  checks = {},
  teamMembers = [],
  storedTheme = null,
  afterLoadValues = {},
} = {}) {
  const elements = new Map();
  const storedValues = new Map(storedTheme ? [["opNoteTheme", storedTheme]] : []);

  function makeElement(id) {
    return {
      id,
      value: "",
      checked: false,
      hidden: false,
      style: {},
      dataset: {},
      textContent: "",
      innerHTML: "",
      classList: {
        values: new Set(),
        add(className) {
          this.values.add(className);
        },
        remove(className) {
          this.values.delete(className);
        },
        contains(className) {
          return this.values.has(className);
        },
        toggle(className, force) {
          if (force) {
            this.values.add(className);
            return true;
          }
          this.values.delete(className);
          return false;
        },
      },
      setAttribute(name, value) {
        this[name] = value;
      },
      removeAttribute(name) {
        delete this[name];
      },
      addEventListener() {},
      appendChild() {},
      querySelectorAll(selector) {
        if (id === "note-form" && selector === "[aria-invalid='true']") {
          return [];
        }

        if (id === "teamMembersList" && selector === ".team-member-row") {
          return teamMembers.map((member) => ({
            querySelector(childSelector) {
              if (childSelector === ".team-member-role") {
                return { value: member.role };
              }

              if (childSelector === ".team-member-name") {
                return { value: member.name };
              }

              return null;
            },
          }));
        }

        return [];
      },
      querySelector() {
        return null;
      },
    };
  }

  function el(id) {
    if (!elements.has(id)) {
      elements.set(id, makeElement(id));
    }

    return elements.get(id);
  }

  const html = fs.readFileSync(path.join(ROOT, "legacy-v1/app.html"), "utf8");
  for (const [, id] of html.matchAll(/id="([^"]+)"/g)) {
    el(id);
  }

  Object.entries(values).forEach(([id, value]) => {
    el(id).value = value;
  });

  Object.entries(checks).forEach(([id, value]) => {
    el(id).checked = value;
  });

  const procedureSections = Array.from(html.matchAll(/data-procedure-section="([^"]+)"/g))
    .map(([, procedureSection]) => ({
      dataset: { procedureSection },
      hidden: false,
    }));
  const procedureChoices = Array.from(html.matchAll(/data-procedure-choice="([^"]+)"/g))
    .map(([, procedureChoice]) => Object.assign(makeElement(`procedure-choice-${procedureChoice}`), {
      dataset: { procedureChoice },
    }));

  const context = {
    console,
    HTMLElement,
    localStorage: {
      getItem(key) {
        return storedValues.has(key) ? storedValues.get(key) : null;
      },
      setItem(key, value) {
        storedValues.set(key, value);
      },
    },
    navigator: {
      clipboard: {
        writeText: async () => {},
      },
    },
    document: {
      documentElement: {
        dataset: {},
      },
      getElementById: el,
      querySelector(selector) {
        const radioMatch = selector.match(/^input\[name="([^"]+)"\]:checked$/);

        if (radioMatch && radios[radioMatch[1]]) {
          return { value: radios[radioMatch[1]] };
        }

        return null;
      },
      querySelectorAll(selector) {
        if (selector === "[data-procedure-section]") {
          return procedureSections;
        }

        if (selector === "[data-procedure-choice]") {
          return procedureChoices;
        }

        return [];
      },
      createElement(tag) {
        return Object.assign(new HTMLElement(), makeElement(tag), { dataset: {} });
      },
    },
  };

  vm.createContext(context);

  SCRIPT_FILES.forEach((scriptPath) => {
    vm.runInContext(
      fs.readFileSync(path.join(ROOT, scriptPath), "utf8"),
      context,
      { filename: scriptPath },
    );
  });

  Object.entries(afterLoadValues).forEach(([id, value]) => {
    el(id).value = value;
  });

  return context;
}

function generateNote(options, mode = "full") {
  const context = createFakeApp(options);
  return vm.runInContext(
    `APP_STATE.activeProcedureId = DOM.procedureSelect.value; DOM.outputMode.value = ${JSON.stringify(mode)}; generateNote(collectValues(), getActiveProcedure()).join("\\n\\n")`,
    context,
  );
}

module.exports = {
  ROOT,
  createFakeApp,
  generateNote,
};
