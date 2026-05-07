# Movie Recommender Testing Defence

## 1. Purpose Of This Lab Work

The purpose of this lab work is to show that the movie recommender project was tested using automated software tests and that the test results can be used to evaluate software quality. The assignment asked for unit tests, integration tests, mocks/stubs/drivers, parameterized tests, setup/tear-down usage, one chosen class tested in code, and coverage evaluation.

This project now contains both backend and frontend tests:

- Backend: JUnit 5, Mockito, Spring MVC test slices, MockRestServiceServer, and JaCoCo.
- Frontend: Vitest, Testing Library, jsdom, and V8 coverage.

The main backend code is tested from service, controller, DTO, entity, importer, and external API integration angles. The frontend test setup verifies the API helper and core UI components/forms.

## 2. How To Run The Tests

### Backend

From the `backend` directory:

```powershell
.\mvnw.cmd clean test
```

This command:

- compiles the backend;
- runs all JUnit tests;
- generates the JaCoCo report;
- runs `jacoco:check`;
- fails the build if backend line coverage drops below 100%.

Backend coverage report:

```text
backend/target/site/jacoco/index.html
```

### Frontend

From the `frontend` directory:

```powershell
npm test
```

This command runs Vitest tests and generates a V8 coverage report.

Frontend coverage report:

```text
frontend/coverage/index.html
```

## 3. Current Test Results

The latest verified results were:

| Area | Test Command | Passing Tests | Line Coverage |
| --- | --- | ---: | ---: |
| Backend | `.\mvnw.cmd clean test` | 51 | 100.00% |
| Frontend tested modules | `npm test` | 9 | 100.00% |

Backend JaCoCo also reported approximately 99.04% instruction coverage. The remaining non-100% instruction/branch coverage is caused by compiler-level branches and conditional bytecode that do not reduce line coverage. The assignment specifically asked to evaluate coverage, and the project now enforces 100% backend line coverage through Maven.

## 4. Assignment Requirement Mapping

| Assignment requirement | How it is covered in this project |
| --- | --- |
| Generate unit tests using JTest/C++Test or similar tools | Backend uses JUnit 5, which is the Java equivalent for this Spring Boot project. Frontend uses Vitest. |
| Generate tests for the whole software application and evaluate coverage | Backend has full line coverage enforced by JaCoCo. Frontend tested modules also report full line coverage. |
| Research and use mocks, stubs, and drivers | Mockito mocks repositories/services. MockRestServiceServer stubs remote TMDB HTTP responses. MockMvc acts as a controller test driver. |
| Research and use parameterized tests | `RatingServiceTest` uses parameterized tests for invalid star values, including null and out-of-range cases. |
| Research and use setup/tear-down phases | `@BeforeEach` is used to construct test fixtures and reusable mocked service state. Frontend tests use global cleanup in `setupTests.js`. |
| Create unit tests for one chosen class | `RatingServiceTest` is the chosen class-focused suite. It tests validation, creation, update, not-found cases, and retrieval. |
| Create integration tests between components | Spring MVC tests verify controllers, JSON request/response handling, and service interaction. TMDB tests verify service behavior against mocked HTTP. |
| Evaluate software test coverage | JaCoCo and Vitest coverage reports are generated, and backend line coverage is enforced in Maven. |
| Present and document created tests | This file and the generated DOCX defence document explain what was tested and how to defend it. |

## 5. Backend Test Inventory

### Auth Tests

`AuthServiceTest`

- verifies user registration;
- verifies password hashing with BCrypt;
- rejects missing username, email, and password;
- rejects duplicate usernames and duplicate emails;
- verifies successful login;
- rejects invalid password;
- rejects missing login fields and unknown email;
- uses mocked `UserRepository` and `JwtService`.

`AuthControllerTest`

- verifies `/auth/register`;
- verifies `/auth/login`;
- uses Spring MVC test slice;
- mocks `AuthService`;
- proves the controller deserializes request JSON and returns response JSON correctly.

`JwtServiceTest`

- verifies token generation;
- checks subject email;
- checks `userId` claim;
- verifies expiration is after issue time.

### Movie Tests

`MovieServiceTest`

- verifies paged movie retrieval;
- verifies mapping from `Movie` entity to `MovieSummaryDto`;
- verifies sorted genres;
- verifies movie detail lookup;
- verifies not-found behavior.

`MovieControllerTest`

- verifies `/movies`;
- verifies `/movies/{id}`;
- uses Spring MVC and mocked `MovieService`.

`TmdbServiceTest`

- verifies parsing of TMDB movie results;
- verifies poster URL construction;
- verifies release date, vote average, and overview mapping;
- verifies caching behavior;
- verifies enrichment of `Movie` entity fields;
- verifies empty lookup handling;
- verifies retry behavior after failed HTTP calls;
- verifies title normalization, trailing articles, aliases, diacritics, and mojibake repair;
- uses `MockRestServiceServer` so no real TMDB API call is made.

`MovieLensImporterTest`

- verifies import is skipped when movies already exist;
- verifies CSV parsing with quoted commas;
- verifies genre parsing;
- verifies `(no genres listed)` is ignored;
- verifies importing from a small test `movies.csv` resource;
- verifies repositories and TMDB enrichment are called;
- uses mocked `MovieRepository`, `GenreRepository`, and `TmdbService`.

`TmdbMovieDataTest`

- verifies `empty()`;
- verifies `isEmpty()` for empty and non-empty DTO states.

### Rating Tests

`RatingServiceTest`

This is the main chosen class for the assignment.

It verifies:

- invalid stars are rejected;
- null stars are rejected;
- new rating creation;
- existing rating update;
- movie-not-found behavior;
- user ratings retrieval;
- saved rating object content through `ArgumentCaptor`.

This test suite demonstrates:

- unit testing;
- setup with `@BeforeEach`;
- Mockito mocks;
- parameterized tests;
- nested test classes;
- assertions on returned DTOs;
- verification that repository methods were or were not called.

`RatingControllerTest`

- verifies POST `/ratings`;
- verifies GET `/ratings/{userId}`;
- tests JSON input/output behavior;
- mocks `RatingService`.

### Supporting Tests

`TestControllerTest`

- verifies `/health` logic returns `OK`;
- verifies DB check formats the `JdbcTemplate` result.

`EntityModelTest`

- verifies entity constructors, getters, setters, and protected JPA constructors for `User`, `Movie`, `Genre`, and `Rating`.

`BackendApplicationTests`

- verifies the application class can be constructed;
- verifies the `main` method delegates to `SpringApplication.run`.

## 6. Frontend Test Inventory

`movies.test.js`

- verifies `getMovies(page)` builds the correct backend URL;
- verifies `getMovieById(id)` builds the correct backend URL;
- verifies API failure responses throw useful errors;
- uses a stubbed global `fetch`.

`LoginPage.test.jsx`

- verifies login page heading;
- verifies email and password fields;
- verifies navigation link to register page;
- fills inputs and submits the form to cover form submission prevention.

`RegisterPage.test.jsx`

- verifies registration page heading;
- verifies name, email, and password fields;
- verifies password minimum length;
- verifies navigation link to login page;
- fills inputs and submits the form.

`StarRating.test.jsx`

- verifies empty prompt before rating;
- verifies filled and empty star display;
- verifies click callback;
- verifies hover and unhover display behavior.

## 7. Mocks, Stubs, And Drivers Used

| Technique | Example | Why it was used |
| --- | --- | --- |
| Mock | `MovieRepository`, `UserRepository`, `RatingRepository` | To test service logic without a real database. |
| Mock | `AuthService`, `MovieService`, `RatingService` | To test controllers independently from business logic. |
| Stub | Global `fetch` in frontend tests | To test API helpers without starting the backend. |
| Stub | `MockRestServiceServer` responses | To test TMDB integration logic without calling the real TMDB API. |
| Driver | `MockMvc` | To drive controller endpoints like an HTTP client. |
| Fixture | Test `movielens/movies.csv` | To test importer behavior using controlled input data. |

## 8. Parameterized Tests

Parameterized tests are used in `RatingServiceTest` for invalid star values. The rating system accepts only values from 1 to 5. The parameterized test checks multiple invalid values with one test definition:

- `null`;
- `0`;
- `6`.

This reduces duplication and proves that validation handles more than one invalid case.

## 9. Setup And Tear-Down

Backend setup:

- `@BeforeEach` in `RatingServiceTest` creates a fresh `RatingService`, `User`, and `Movie` before each test.
- `@BeforeEach` in `TmdbServiceTest` creates a fresh `TmdbService`, injects test configuration values, and attaches a new `MockRestServiceServer`.

Frontend tear-down:

- `frontend/src/setupTests.js` calls Testing Library `cleanup()` after each test.
- This prevents DOM from one test leaking into another test.

## 10. Coverage Strategy

The backend coverage strategy is intentionally strict:

- JaCoCo generates a report after tests.
- `jacoco:check` enforces 100% backend line coverage.
- The test suite includes services, controllers, DTO helpers, entities, importer logic, and external API handling.

The frontend coverage strategy covers the modules currently included in the frontend test suite:

- API helper;
- login form;
- register form;
- star rating component.

The coverage command is part of the frontend `npm test` script.

## 11. Why Some Tests Use Reflection

Some helper methods in `TmdbService` and `MovieLensImporter` are private because they are implementation details. A few tests use `ReflectionTestUtils` to verify these helper methods directly.

This was done because:

- the assignment requires high/complete coverage;
- some branches are hard to reach only through public methods;
- the private methods contain meaningful parsing/normalization logic;
- testing them directly makes the tests focused and understandable.

In a production team, it could also be reasonable to extract these helpers into package-private utility classes instead of testing them through reflection.

## 12. Important Defence Points

If asked why mocks were used:

> Mocks isolate the unit being tested. For example, `RatingService` can be tested without a real database because repositories are mocked.

If asked why integration tests were added:

> Unit tests prove business logic, while controller integration tests prove HTTP request/response behavior, JSON serialization, routing, and interaction with services.

If asked why TMDB is mocked:

> Tests should be deterministic. Calling the real TMDB API would require internet access, an API key, and stable third-party responses. `MockRestServiceServer` lets us test our TMDB integration logic without depending on the real service.

If asked what class was chosen for detailed unit testing:

> `RatingService` was chosen because it contains validation, database lookup logic, update-or-create logic, and DTO mapping. It is a good representative business-service class.

If asked how coverage is evaluated:

> Backend coverage is evaluated by JaCoCo. The HTML report is generated at `backend/target/site/jacoco/index.html`. The Maven build also enforces 100% line coverage using `jacoco:check`.

If asked what parameterized testing means:

> A parameterized test runs the same test logic with multiple inputs. In this project it checks multiple invalid rating values without duplicating the test body.

If asked what setup/tear-down means:

> Setup prepares clean test data before each test. Tear-down/cleanup removes test state after a test. This prevents tests from affecting each other.

## 13. Limitations And Honest Notes

- Backend line coverage is 100%, but branch coverage is not 100%. The assignment asked to evaluate coverage; the project enforces full line coverage, which is the clearest measure for "all lines executed."
- Some tests use reflection for private helper methods. This helps reach full coverage but can make tests more coupled to implementation details.
- The importer test intentionally uses a test CSV with 100 imported rows to cover the progress logging line.
- Frontend coverage is for tested modules. Some larger pages are not yet part of the frontend test suite.

## 14. Summary

The lab work now demonstrates:

- unit tests;
- controller integration tests;
- mocked dependencies;
- stubbed HTTP and frontend fetch calls;
- parameterized tests;
- setup and cleanup phases;
- one chosen class tested in detail;
- coverage reports;
- enforced backend 100% line coverage;
- documentation for presenting and defending the work.

The most important result is that backend testing is not only present but enforced. If future code reduces backend line coverage below 100%, the Maven test command fails.
