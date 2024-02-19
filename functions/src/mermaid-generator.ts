
export const generateStateDeclaration = (
  identation: number,
  id: string,
  key: string) => {
  const stringTokens: Array<string> = [];
  stringTokens.push(
    "  ".repeat(identation) +
    `${id} : ${key}\n`);
  return stringTokens;
};

export const generateTransitionToFinal = (
  identation: number,
  id: string) => {
  const stringTokens: Array<string> = [];
  stringTokens.push(
    "  ".repeat(identation) +
    `${id} --> [*]\n`);
  return stringTokens;
};

export const generateCompositeState = (
  currentId: string,
  initialStateId: string,
  identation: number,
  internalStateStringTokens: Array<string>
): Array<string> => {
  let stringTokens: Array<string> = [];
  stringTokens.push("  ".repeat(identation) +
    `state ${currentId} {\n`);
  stringTokens.push("  ".repeat(identation + 1) +
    "[*] --> " +
    `${initialStateId}\n`);
  stringTokens = stringTokens.concat(internalStateStringTokens);
  stringTokens.push("  ".repeat(identation) + "}\n");
  return stringTokens;
};

export const generateInternalState = (
  stateMachineNode: any,
  identation: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  first: boolean,
  visitNodeFn:
    (stateMachineNode: any, identation: number) => Array<string>) => {
  return visitNodeFn(stateMachineNode,
    identation);
};

export const generateConcurrentStates = (
  currentId: string,
  identation: number,
  internalStateStringTokens: Array<string>
): Array<string> => {
  let stringTokens: Array<string> = [];
  stringTokens.push("  ".repeat(identation) +
    `state ${currentId} {\n`);
  stringTokens = stringTokens.concat(internalStateStringTokens);
  stringTokens.push("  ".repeat(identation) + "}\n");
  return stringTokens;
};

export const generateEachConcurrentState = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stateMachineNode: any,
  identation: number,
  first: boolean,
  visitNodeFn:
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (stateMachineNode: any, identation: number) => Array<string>) => {
  let stringTokens: Array<string> = [];
  if (!first) {
    stringTokens.push(
      "  ".repeat(identation) +
      "--\n");
  }
  stringTokens = stringTokens.concat(
    visitNodeFn(stateMachineNode,
      identation));
  return stringTokens;
};

export const generateTransition = (
  currentStateId: string,
  targetStateId: string,
  identation: number,
  eventName: string, guard: string) => {
  const stringTokens: Array<string> = [];
  stringTokens.push("  ".repeat(identation) +
    `${currentStateId} --> ${targetStateId} :` +
    ` ${eventName}` +
    `${guard === "" ? "" : "/" + guard}\n`);
  return stringTokens;
};
