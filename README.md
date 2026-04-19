# Outty-App
This team project aims to build an outdoor app (called Outty) for adventure seekers. Whether they're into hiking, kayaking, rock climbing, or just exploring new trails, the app matches them with like-minded adventurers who share their passion for the great outdoors.

## Project coontributors and Roles:
- Roan Simo Masso: Product owner
- Andre Dumas: Scrum Master
- Oluwatomisin Adegbayi: Developer
- Tobechukwu Eziolise: Developer
- Andre Steeve Mocto Ngatchouissi: Developer

### Rationale for CI
- CI tool : Github Actions
- Automated Master Builds: The system triggers an automated build sequence every time code is merged into the main branch, ensuring that the production-ready code remains stable.
- Static Analysis & Quality Control: By executing linting scripts (npm run lint) during the build process, we enforce a consistent coding style across both the React Native frontend and Node.js backend.
- Infrastructure Consistency: GitHub Actions provides a clean, containerized environment that mirrors the deployment environment, catching syntax errors or missing dependencies before they reach production.
- Workflow status: Real-time build results can be found in the Actions tab of this repository or at (https://github.com/Steeve06/Outty-App/actions).
