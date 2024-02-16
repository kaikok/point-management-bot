jest.mock("../src/data-access");
import {updateDoc} from "../src/data-access";
import {updateUserXStateContext} from "../src/user";


describe("Test user.ts", () => {
  describe("updateUserXStateContext", () => {
    test("it exist", async () => {
      expect(updateUserXStateContext).not.toBeNull();
    });

    test("it invokes updateDoc", async () => {
      updateUserXStateContext(1234, "jsonified xstate context");
      expect(updateDoc).toHaveBeenCalledWith("users/1234", {"xstateContext": "jsonified xstate context"});
    });
  });
});