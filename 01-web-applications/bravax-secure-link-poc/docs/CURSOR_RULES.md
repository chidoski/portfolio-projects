# CURSOR_RULES.md

## Development Guidelines for Bravax Secure Link POC

### Pre-Development Requirements

1. **Read Documentation First**
   - Always read `docs/PRD_Bravax_Secure_Link.md` before starting any coding work
   - Review `docs/POC_Execution_Steps.md` to understand current step and requirements
   - Understand the acceptance criteria for the current step before proceeding

### File Management Rules

2. **Strict File Scope**
   - Only create or modify files that are explicitly listed in the current step of `POC_Execution_Steps.md`
   - Do not create additional files or modify existing files outside the current step scope
   - If additional files are needed, propose the changes in `POC_Execution_Steps.md` first

3. **Preserve Existing Structure**
   - Maintain all existing exports and function signatures when modifying files
   - Keep existing filenames and directory structure intact
   - If refactoring is needed, document the proposal in `POC_Execution_Steps.md` before implementation

### Progress Tracking

4. **Working Code Index Updates**
   - After any file creation or modification, immediately append a new row to the "Working Code Index" table in `POC_Execution_Steps.md`
   - Include: filename, purpose of the change, and the step number where it was modified
   - This ensures complete traceability of all code changes throughout the POC

### POC Constraints

5. **No Backend Implementation**
   - This is a frontend-only POC - do not implement actual backend services
   - Do not integrate with real authentication systems or SSO providers
   - Do not implement real email or SMS functionality

6. **Simulation Over Integration**
   - Use simulated tokens and OTP codes stored in localStorage
   - Mock all external API calls and data sources
   - Focus on demonstrating the user experience and approval workflows
   - All authentication and authorization should be simulated client-side

### Code Quality Standards

7. **TypeScript Requirements**
   - Use strict TypeScript typing throughout
   - Define proper interfaces for all data structures
   - Avoid `any` types - use proper type definitions

8. **Component Architecture**
   - Follow React best practices with functional components and hooks
   - Keep components focused and single-responsibility
   - Use proper prop typing and component composition

### Testing and Validation

9. **Step Completion Criteria**
   - Ensure all acceptance checks for the current step are met before moving to the next step
   - Test all user flows defined in the current step
   - Validate that the implementation matches the PRD requirements

10. **Documentation Updates**
    - Update `POC_Execution_Steps.md` if implementation reveals the need for additional steps
    - Document any deviations from the original plan with clear reasoning
    - Keep the Working Code Index current and accurate
