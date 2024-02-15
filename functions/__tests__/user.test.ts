jest.mock("../src/data-access");
import {updateDoc} from "../src/data-access";
import {updateUserXStateContext} from "../src/user";
import {mockGoogleCloudFirestore} from 'firestore-jest-mock';


describe("Test user.ts", () => {
  describe("updateUserXStateContext", () => {
    test("it exist", async () => {
      expect(updateUserXStateContext).not.toBeNull();
    });

    test("it invokes updateDoc", async () => {
      updateUserXStateContext(mockGoogleCloudFirestore as any, 1234, "jsonified xstate context");
      expect(updateDoc).toHaveBeenCalledWith(mockGoogleCloudFirestore, "users/1234", {"xstateContext": "jsonified xstate context"});
    });
  });
});