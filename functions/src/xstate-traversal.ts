/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  generateCompositeState,
  generateConcurrentStates,
  generateTransition,
  generateEachConcurrentState,
  generateInternalState,
  generateTransitionToFinal,
  generateStateDeclaration} from "./mermaid-generator";

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

export const visitXStateNode = (
  stateMachineNode: any, identation: number): Array<string> => {
  let stringTokens: Array<string> = [];
  const {id: currentId, type, transitions, parent, states} = stateMachineNode;

  stringTokens = stringTokens.concat(
    generateStateDeclaration(
      identation, currentId, stateMachineNode.key));

  if (type === "compound") {
    stringTokens = stringTokens.concat(
      generateCompositeState(
        currentId,
        getXStateInitialState(stateMachineNode).id,
        identation,
        forEachXStateSubStates(
          states, identation, generateInternalState, visitXStateNode)));
  }

  if (type === "parallel") {
    stringTokens = stringTokens.concat(
      generateConcurrentStates(
        currentId,
        identation,
        forEachXStateSubStates(
          states, identation, generateEachConcurrentState, visitXStateNode)));
  }

  stringTokens = stringTokens.concat(
    forEachXStateTransitions(
      transitions, parent, identation, currentId, generateTransition));

  if (type === "final") {
    stringTokens = stringTokens.concat(
      generateTransitionToFinal(identation, currentId));
  }

  return stringTokens;
};

export const getXStateInitialState = (stateMachineNode: any) => {
  return stateMachineNode.states[stateMachineNode.config.initial];
};

const forEachXStateSubStates = (
  states: any,
  identation: number,
  callbackFn:
    (stateMachineNode: any, identation: number, first: boolean,
      visitNodeFn:
        (stateMachineNode: any, identation: number) => Array<string>
      ) => Array<string>,
  visitNodeFn:
    (stateMachineNode: any, identation: number) => Array<string>) => {
  let stringTokens: Array<string> = [];
  let first = true;
  if (states) {
    const stateName = Object.keys(states);
    for (const idx in stateName) {
      if (Object.prototype.hasOwnProperty.call(
        stateName, idx)) {
        stringTokens = stringTokens.concat(
          callbackFn(
            states[stateName[idx]], identation + 1, first, visitNodeFn));
        if (first) {
          first = false;
        }
      }
    }
  }
  return stringTokens;
};

const forEachXStateTransitions = (
  transitions: any, parent: any,
  identation: number, id: any,
  callbackFn: (
    currentStateId: string,
    targetStateId: string,
    identation: number,
    eventName: string,
    guard: string) => Array<string>) => {
  let stringTokens: Array<string> = [];
  for (const [eventName, transition] of transitions) {
    const targets = transition[0].target;
    const guard = transition[0].guard;

    for (const idx in targets) {
      if (Object.prototype.hasOwnProperty.call(targets, idx)) {
        const srcParentId = parent.id;
        const targetParentId = targets[idx].parent.id;
        // Check for within same state machine
        if (srcParentId === targetParentId) {
          stringTokens = stringTokens.concat(callbackFn(
            id,
            targets[idx].id,
            identation,
            transformXStateEventLabel(eventName), guard ? guard : ""));
        } else {
          stringTokens = stringTokens.concat(forEachXStateSiblingState(
            targets[idx].parent.states,
            targets[idx],
            identation,
            transformXStateEventLabel(eventName),
            guard ? guard : "",
            callbackFn));
        }
      }
    }
  }
  return stringTokens;
};

export const transformXStateEventLabel = (label: string) => {
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

const forEachXStateSiblingState = (
  siblingStates: any,
  currentState: any,
  identation: number,
  eventName: string,
  guard: string,
  callbackFn: (
    currentStateId: string,
    targetStateId: string,
    identation: number,
    eventName: string,
    guard: string) => Array<string>) => {
  let stringTokens: Array<string> = [];
  if (siblingStates) {
    const stateName = Object.keys(siblingStates);
    for (const stateIdx in stateName) {
      if (Object.prototype.hasOwnProperty.call(
        stateName, stateIdx)) {
        if (currentState.id !== siblingStates[stateName[stateIdx]].id) {
          stringTokens = stringTokens.concat(callbackFn(
            siblingStates[stateName[stateIdx]].id,
            currentState.id,
            identation,
            transformXStateEventLabel(eventName),
            guard ? guard : ""));
        }
      }
    }
  }
  return stringTokens;
};
