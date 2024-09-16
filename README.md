# ELMA Project

## Technology Stack and Features

- [**Turborepo**](https://turbo.build/repo/docs) for managing monorepos.
- [**ElysiaJS**](https://elysiajs.com) for the Typescript backend API.
    - [MySQL](https://www.mysql.com) as the SQL database.
    - [mysql2](https://sidorares.github.io/node-mysql2/docs) for the MySQL client.
    <!-- - ~~[Prisma](https://www.prisma.io) for the database client.~~ -->
- [**NextJS**](https://nextjs.org) for the frontend.
    - Using TypeScript.
    <!-- - [TailwindCSS](https://tailwindcss.com) for styling. -->
    - [shadcn/ui](https://ui.shadcn.com) for the frontend UI components.
    - [Axios](https://axios-http.com) for making HTTP requests.
    - [React hook form](https://react-hook-form.com) for form handling.
    - [Zod](https://zod.dev) for schema validation.
- [Docker Compose](https://www.docker.com) for development and production.
- Secure password hashing using [bun hashing](https://bun.sh/docs/api/hashing) with [bcrypt](https://www.npmjs.com/package/bcrypt).
- [JWT (JSON Web Tokens)](https://jwt.io) for authentication.
- [BiomeJS](https://biomejs.dev) for the linter and code formatter.

## LICENSE
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.