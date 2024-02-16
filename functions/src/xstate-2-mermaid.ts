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

export const recurseXStateNode = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateMachineNode: any, rootStateId: string, identation: number) => {
  let mermaidString = "";
  const {id, type, transitions, parent, states} = stateMachineNode;

  if (rootStateId === id) {
    mermaidString = mermaidString.concat("stateDiagram-v2\n");
  }

  mermaidString =
    mermaidString.concat(
      "  ".repeat(identation) +
      `${id} : ${stateMachineNode.key}\n`);

  if (type === "compound") {
    mermaidString =
      mermaidString.concat("  ".repeat(identation) +
        `state ${id} {\n`);
    mermaidString =
      mermaidString.concat("  ".repeat(identation + 1) +
        "[*] --> " +
        `${getInitialState(stateMachineNode).id}\n`);
    if (states) {
      const stateName = Object.keys(states);
      for (const idx in stateName) {
        if (Object.prototype.hasOwnProperty.call(
          stateName, idx)) {
          mermaidString =
            mermaidString.concat(
              recurseXStateNode(states[stateName[idx]],
                rootStateId,
                identation + 1));
        }
      }
    }
    mermaidString =
      mermaidString.concat("  ".repeat(identation) + "}\n");
  }

  if (type === "parallel") {
    mermaidString =
      mermaidString.concat("  ".repeat(identation) +
        `state ${id} {\n`);
    if (states) {
      const stateName = Object.keys(states);
      let first = true;
      for (const idx in stateName) {
        if (Object.prototype.hasOwnProperty.call(
          stateName, idx)) {
          if (first) {
            first = false;
          } else {
            mermaidString = mermaidString.concat(
              "  ".repeat(identation + 1) +
              "--\n");
          }
          mermaidString =
            mermaidString.concat(
              recurseXStateNode(states[stateName[idx]],
                rootStateId,
                identation + 1));
        }
      }
    }
    mermaidString =
      mermaidString.concat("  ".repeat(identation) + "}\n");
  }

  for (const [eventName, transition] of transitions) {
    const targets = transition[0].target;
    const guard = transition[0].guard;

    for (const idx in targets) {
      if (Object.prototype.hasOwnProperty.call(targets, idx)) {
        const srcParentId = parent.id;
        const targetParentId = targets[idx].parent.id;
        if (srcParentId === targetParentId) {
          mermaidString =
            mermaidString.concat(
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
                  mermaidString =
                    mermaidString.concat(
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

  if (type === "final") {
    mermaidString =
      mermaidString.concat(
        "  ".repeat(identation) +
        `${id} --> [*]\n`);
  }

  return mermaidString;
};

export const generateMermaid = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateMachine: any) => {
  return recurseXStateNode(stateMachine.root, stateMachine.root.config.id, 0);
};
