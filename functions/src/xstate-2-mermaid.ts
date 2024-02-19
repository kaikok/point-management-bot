const eventLabelTransformers = [
  {
    active: true,
    pattern: /xstate\.done\.actor\.[0-9].*\.([^.]+)$/,
    replacement: "$1.OnDone",
  },
  {
    active: true,
    pattern: /xstate\.error\.actor\.[0-9].*\.([^.]+)$/,
    replacement: "$1.OnError",
  },
  {
    active: true,
    pattern: /xstate\.done.*\.([^.]+)$/,
    replacement: "$1.OnDone",
  },
  {
    active: true,
    pattern: /xstate\.error.*\.([^.]+)$/,
    replacement: "$1.OnError",
  },
];

export const transformEventLabel = (label: string) => {
  let transformed = label;
  eventLabelTransformers.forEach((transformer) => {
    if (transformer.active) {
      const replaced = label.replace(
        transformer.pattern, transformer.replacement);
      if (replaced !== label) {
        transformed = replaced;
      }
    }
  });
  return transformed;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getInitialState = (stateMachineNode: any) => {
  return stateMachineNode.states[stateMachineNode.config.initial];
};

// Mermaid generation routines
const generateStateDeclaration = (
  stringTokens: string[],
  identation: number,
  id: any,
  key: any) => {
  stringTokens.push(
    "  ".repeat(identation) +
    `${id} : ${key}\n`);
};

const generateCompositeStatePreamble = (
  identation: number,
  id: any, stateMachineNode: any) => {
  const stringTokens: Array<string> = [];
  stringTokens.push("  ".repeat(identation) +
    `state ${id} {\n`);
  stringTokens.push("  ".repeat(identation + 1) +
    "[*] --> " +
    `${getInitialState(stateMachineNode).id}\n`);
  return stringTokens;
};

const generateInternalState = (
  stateMachineNode: any,
  identation: number,
  first: boolean) => {
  return recurseXStateNode(stateMachineNode,
    identation);
};

const generateConcurrentState = (
  stateMachineNode: any,
  identation: number,
  first: boolean) => {
  let stringTokens: Array<string> = [];
  if (!first) {
    stringTokens.push(
      "  ".repeat(identation) +
      "--\n");
  }
  stringTokens = stringTokens.concat(
    recurseXStateNode(stateMachineNode,
      identation));
  return stringTokens;
};

const enumerateXStateSubStates = (
  states: { [x: string]: any; },
  identation: number,
  enumerator:
    (stateMachineNode: any, identation: number, first: boolean)
    => Array<string>) => {
  let stringTokens: Array<string> = [];
  let first = true;
  if (states) {
    const stateName = Object.keys(states);
    for (const idx in stateName) {
      if (Object.prototype.hasOwnProperty.call(
        stateName, idx)) {
        stringTokens = stringTokens.concat(
          enumerator(states[stateName[idx]], identation + 1, first));
        if (first) {
          first = false;
        }
      }
    }
  }
  return stringTokens;
};

const enumerateXStateTransitions = (
  transitions: any, parent: any, identation: number, id: any) => {
  const stringTokens: Array<string> = [];
  for (const [eventName, transition] of transitions) {
    const targets = transition[0].target;
    const guard = transition[0].guard;

    for (const idx in targets) {
      if (Object.prototype.hasOwnProperty.call(targets, idx)) {
        const srcParentId = parent.id;
        const targetParentId = targets[idx].parent.id;
        if (srcParentId === targetParentId) {
          stringTokens.push(
            "  ".repeat(identation) +
            `${id} --> ${targets[idx].id} :` +
            ` ${transformEventLabel(eventName)}` +
            `${guard ? "/" + guard : ""}\n`);
        } else {
          const siblingStates = targets[idx].parent.states;
          if (siblingStates) {
            const stateName = Object.keys(siblingStates);
            for (const stateIdx in stateName) {
              if (Object.prototype.hasOwnProperty.call(
                stateName, stateIdx)) {
                if (targets[idx].id !== siblingStates[stateName[stateIdx]].id) {
                  stringTokens.push(
                    "  ".repeat(identation) +
                    `${siblingStates[stateName[stateIdx]].id} -->` +
                    ` ${targets[idx].id} :` +
                    ` ${transformEventLabel(eventName)}` +
                    `${guard ? "/" + guard : ""}\n`);
                }
              }
            }
          }
        }
      }
    }
  }
  return stringTokens;
};

export const recurseXStateNode = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateMachineNode: any, identation: number) => {
  let stringTokens: Array<string> = [];
  const {id, type, transitions, parent, states} = stateMachineNode;

  generateStateDeclaration(
    stringTokens,
    identation,
    id,
    stateMachineNode.key);

  if (type === "compound") {
    stringTokens = stringTokens.concat(
      generateCompositeStatePreamble(identation, id, stateMachineNode));

    stringTokens = stringTokens.concat(
      enumerateXStateSubStates(states, identation, generateInternalState));
    stringTokens.push("  ".repeat(identation) + "}\n");
  }

  if (type === "parallel") {
    stringTokens.push("  ".repeat(identation) +
        `state ${id} {\n`);
    stringTokens = stringTokens.concat(
      enumerateXStateSubStates(states, identation, generateConcurrentState));
    stringTokens.push("  ".repeat(identation) + "}\n");
  }

  // for (const [eventName, transition] of transitions) {
  //   const targets = transition[0].target;
  //   const guard = transition[0].guard;

  //   for (const idx in targets) {
  //     if (Object.prototype.hasOwnProperty.call(targets, idx)) {
  //       const srcParentId = parent.id;
  //       const targetParentId = targets[idx].parent.id;
  //       if (srcParentId === targetParentId) {
  //         stringTokens.push(
  //           "  ".repeat(identation) +
  //           `${id} --> ${targets[idx].id} :` +
  //           ` ${transformEventLabel(eventName)}` +
  //           `${guard ? "/" + guard : ""}\n`);
  //       } else {
  //         const siblingStates = targets[idx].parent.states;
  //         if (siblingStates) {
  //           const stateName = Object.keys(siblingStates);
  //           for (const stateIdx in stateName) {
  //             if (Object.prototype.hasOwnProperty.call(
  //               stateName, stateIdx)) {
  //               if (targets[idx].id !== siblingStates[stateName[stateIdx]].id) {
  //                 stringTokens.push(
  //                   "  ".repeat(identation) +
  //                   `${siblingStates[stateName[stateIdx]].id} -->` +
  //                   ` ${targets[idx].id} :` +
  //                   ` ${transformEventLabel(eventName)}` +
  //                   `${guard ? "/" + guard : ""}\n`);
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
  stringTokens = stringTokens.concat(
    enumerateXStateTransitions(transitions, parent, identation, id));

  if (type === "final") {
    stringTokens.push(
      "  ".repeat(identation) +
      `${id} --> [*]\n`);
  }

  // console.log(stringTokens);
  return stringTokens;
};

export const generateMermaid = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateMachine: any) => {
  let stringTokens : Array<string> = [];
  stringTokens.push("stateDiagram-v2\n");
  stringTokens = stringTokens.concat(
    recurseXStateNode(stateMachine.root, 0));
  return stringTokens.join("");
};
