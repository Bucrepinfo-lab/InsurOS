import { MemoryAuthStore } from "../src";
import { deviceAuthContract } from "./device-auth-contract";

deviceAuthContract("memory store", () => new MemoryAuthStore());
