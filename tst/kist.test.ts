// ============================================================================
// Kist Core Tests
// ============================================================================

describe("kist", () => {
    it("should pass sanity check", () => {
        expect(1 + 1).toBe(2);
    });

    it("should have correct environment", () => {
        expect(process.env.NODE_ENV).toBeDefined();
    });
});
