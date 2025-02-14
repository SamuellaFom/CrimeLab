## Crime Lab - groupe 4

### Installation Guide
  * Run ``npm install`` to install all dependencies
  * Run ``npm run migrate`` to migrate collection in mongo database
  * Create an config.json file in your project root folder and add your variables. See configExample.json for assistance.

### Use
  * Run ```npm run dev``` to start the application.


| HTTP Verbs | Endpoints                  | Action                                          |
|------------|----------------------------|-------------------------------------------------|
| **Affair**      |                            |                                                 |
| POST       | /create/affair/             | To create a new affair                         |
| GET        | /allAffairs                 | To return all affairs                          |
| GET        | /getAffair/:title           | To return the searched affair by title         |
| GET        | /getAffair/:affairNumber    | To return the searched affair by affair number |
| PUT        | /update/affair/:affairNumber| To update the affair by affair number          |
| DELETE     | /delete/affair/:affairNumber| To delete the affair by affair number          |
| **Individual** |                            |                                                 |
| POST       | /create/individual/         | To create a new individual                      |
| GET        | /allIndividuals             | To return all individuals                      |
| GET        | /getIndividual/:id          | To return the searched individual by ID         |
| PUT        | /update/individual/:id      | To update the individual by ID                 |
| DELETE     | /delete/individual/:id      | To delete the individual by ID                 |
| **Place**      |                            |                                                 |
| POST       | /create/place/              | To create a new place                          |
| GET        | /allPlaces                  | To return all places                           |
| GET        | /getPlace/:id               | To return the searched place by ID             |
| PUT        | /update/place/:id           | To update the place by ID                      |
| DELETE     | /delete/place/:id           | To delete the place by ID                      |
| **Testimony**  |                            |                                                 |
| POST       | /create/testimony/          | To create a new testimony                      |
| GET        | /allTestimonies             | To return all testimonies                      |
| GET        | /getTestimony/:id           | To return the searched testimony by ID         |
| PUT        | /update/testimony/:id       | To update the testimony by ID                  |
| DELETE     | /delete/testimony/:id       | To delete the testimony by ID                  |
| **Fadette**    |                            |                                                 |
| POST       | /create/fadette/            | To create a new fadette                        |
| GET        | /getFadette/:id             | To return the searched fadette by ID           |

