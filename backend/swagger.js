const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Concert App REST API',
    version: '1.0.0',
    description: 'Documentazione interattiva OpenAPI/Swagger per la piattaforma di car-sharing e bacheca concerti "Concert App" (MERN Stack).',
    contact: {
      name: 'Team Concert App',
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Server di sviluppo locale'
    }
  ],
  tags: [
    { name: 'Autenticazione', description: 'Registrazione, login e gestione dual-token JWT' },
    { name: 'Concerti', description: 'Catalogo concerti con sincronizzazione Ticketmaster' },
    { name: 'Chat', description: 'Bacheca messaggi in tempo reale associata agli eventi' },
    { name: 'Viaggi (Car-Sharing)', description: 'Offerta corse, gestione posti e prenotazioni' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Inserisci il token JWT nel formato: Bearer <AccessToken>'
      }
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65e21a8f9b1c2d001a3f4e5a' },
          username: { type: 'string', example: 'mario_rossi' },
          name: { type: 'string', example: 'Mario Rossi' },
          email: { type: 'string', format: 'email', example: 'mario@example.com' }
        }
      },
      UserRegisterInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          username: { type: 'string', example: 'mario_rossi' },
          name: { type: 'string', example: 'Mario Rossi' },
          email: { type: 'string', format: 'email', example: 'mario@example.com' },
          password: { type: 'string', format: 'password', example: 'PasswordSicura123!' }
        }
      },
      UserLoginInput: {
        type: 'object',
        required: ['password'],
        properties: {
          email: { type: 'string', example: 'mario@example.com' },
          username: { type: 'string', example: 'mario_rossi' },
          password: { type: 'string', format: 'password', example: 'PasswordSicura123!' }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Accesso eseguito con successo' },
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
          user: { $ref: '#/components/schemas/User' }
        }
      },
      RefreshTokenInput: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' }
        }
      },
      Passenger: {
        type: 'object',
        properties: {
          userId: { type: 'string', example: '65e21a8f9b1c2d001a3f4e5b' },
          userName: { type: 'string', example: 'Luca Bianchi' },
          bookedAt: { type: 'string', example: '2026-09-14T12:00:00.000Z' }
        }
      },
      Trip: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65e21a8f9b1c2d001a3f4e5c' },
          driverId: { type: 'string', example: '65e21a8f9b1c2d001a3f4e5a' },
          driverName: { type: 'string', example: 'Mario Rossi' },
          concertId: { type: 'string', example: '65e21a8f9b1c2d001a3f4e5d' },
          concertName: { type: 'string', example: 'Coldplay - Music of the Spheres' },
          departureCity: { type: 'string', example: 'Bologna' },
          meetingPoint: { type: 'string', example: 'Stazione Centrale - Ingresso Piazza Medaglie d\'Oro' },
          departureTime: { type: 'string', example: '16:30' },
          availableSeats: { type: 'integer', example: 3 },
          pricePerSeat: { type: 'number', example: 15 },
          passengers: {
            type: 'array',
            items: { $ref: '#/components/schemas/Passenger' }
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      TripInput: {
        type: 'object',
        required: ['driverId', 'driverName', 'concertName', 'departureCity', 'departureTime', 'availableSeats', 'pricePerSeat'],
        properties: {
          driverId: { type: 'string', example: '65e21a8f9b1c2d001a3f4e5a' },
          driverName: { type: 'string', example: 'Mario Rossi' },
          concertId: { type: 'string', example: '65e21a8f9b1c2d001a3f4e5d' },
          concertName: { type: 'string', example: 'Coldplay - Music of the Spheres' },
          departureCity: { type: 'string', example: 'Bologna' },
          meetingPoint: { type: 'string', example: 'Stazione Centrale' },
          departureTime: { type: 'string', example: '16:30' },
          availableSeats: { type: 'integer', minimum: 1, example: 3 },
          pricePerSeat: { type: 'number', minimum: 0, example: 15 }
        }
      },
      ChatMessage: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65e21a8f9b1c2d001a3f4e5e' },
          userName: { type: 'string', example: 'Giulia Verdi' },
          text: { type: 'string', example: 'Ciao a tutti! Qualcuno parte da Ferrara?' },
          time: { type: 'string', example: '14/09/2026 - 15:45' }
        }
      },
      ChatMessageInput: {
        type: 'object',
        required: ['userName', 'text'],
        properties: {
          userName: { type: 'string', example: 'Giulia Verdi' },
          text: { type: 'string', example: 'Qualcuno sa se i cancelli aprono alle 18:00?' }
        }
      },
      Concert: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '65e21a8f9b1c2d001a3f4e5d' },
          title: { type: 'string', example: 'Coldplay' },
          artist: { type: 'string', example: 'Coldplay' },
          city: { type: 'string', example: 'Milano' },
          venue: { type: 'string', example: 'Stadio San Siro' },
          date: { type: 'string', example: '2026-06-25' },
          genre: { type: 'string', example: 'Rock/Pop' },
          imageUrl: { type: 'string', example: 'https://s1.ticketm.net/dam/a/...' },
          messages: {
            type: 'array',
            items: { $ref: '#/components/schemas/ChatMessage' }
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Messaggio descrittivo dell\'errore' }
        }
      }
    }
  },
  paths: {
    '/api/register': {
      post: {
        tags: ['Autenticazione'],
        summary: 'Registrazione nuovo account utente',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserRegisterInput' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Registrazione completata con successo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Registrazione completata con successo' },
                    user: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Dati mancanti o credenziali (username/email) già in uso',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          '500': {
            description: 'Errore interno del server',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/login': {
      post: {
        tags: ['Autenticazione'],
        summary: 'Accesso utente e rilascio Access Token + Refresh Token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserLoginInput' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Accesso riuscito con rilascio token JWT',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          '400': {
            description: 'Campi obbligatori mancanti',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          '401': {
            description: 'Credenziali non valide',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/refresh-token': {
      post: {
        tags: ['Autenticazione'],
        summary: 'Rinnovo dell\'Access Token mediante Refresh Token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenInput' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Nuovo Access Token generato con successo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Refresh Token mancante',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          },
          '403': {
            description: 'Refresh Token scaduto o non valido',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/concerts': {
      get: {
        tags: ['Concerti'],
        summary: 'Recupera tutti i concerti a catalogo (con sincronizzazione Ticketmaster)',
        responses: {
          '200': {
            description: 'Elenco concerti recuperato con successo',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Concert' }
                }
              }
            }
          },
          '500': {
            description: 'Errore nel recupero dei concerti',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/concerts/{id}': {
      get: {
        tags: ['Concerti'],
        summary: 'Recupera il dettaglio del singolo concerto con i messaggi della bacheca',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID univoco del concerto (ObjectId)',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Dettagli del concerto e messaggi chat',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Concert' }
              }
            }
          },
          '404': {
            description: 'Concerto non trovato',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } }
          }
        }
      }
    },
    '/api/concerts/{id}/messages': {
      post: {
        tags: ['Chat'],
        summary: 'Invia un messaggio nella chat room del concerto',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID univoco del concerto',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChatMessageInput' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Messaggio inviato con successo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    messages: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/ChatMessage' }
                    }
                  }
                }
              }
            }
          },
          '401': { description: 'Token mancante o non autorizzato' },
          '404': { description: 'Concerto non trovato' }
        }
      }
    },
    '/api/concerts/{id}/messages/{msgId}': {
      delete: {
        tags: ['Chat'],
        summary: 'Elimina un messaggio dalla chat del concerto',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del concerto',
            schema: { type: 'string' }
          },
          {
            name: 'msgId',
            in: 'path',
            required: true,
            description: 'ID del messaggio da eliminare',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Messaggio eliminato con successo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Messaggio eliminato.' }
                  }
                }
              }
            }
          },
          '401': { description: 'Token mancante o non autorizzato' },
          '404': { description: 'Concerto o messaggio non trovato' }
        }
      }
    },
    '/api/trips': {
      get: {
        tags: ['Viaggi (Car-Sharing)'],
        summary: 'Recupera tutti i viaggi disponibili',
        responses: {
          '200': {
            description: 'Elenco dei viaggi di car-sharing',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Trip' }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Viaggi (Car-Sharing)'],
        summary: 'Pubblica una nuova offerta di passaggio auto',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TripInput' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Viaggio creato con successo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    trip: { $ref: '#/components/schemas/Trip' }
                  }
                }
              }
            }
          },
          '400': { description: 'Campi obbligatori mancanti' },
          '401': { description: 'Accesso negato. Token non valido o mancante' }
        }
      }
    },
    '/api/trips/{id}': {
      put: {
        tags: ['Viaggi (Car-Sharing)'],
        summary: 'Aggiorna i dettagli di un viaggio esistente',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del viaggio da modificare',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TripInput' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Viaggio modificato con successo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    trip: { $ref: '#/components/schemas/Trip' }
                  }
                }
              }
            }
          },
          '404': { description: 'Viaggio non trovato' }
        }
      },
      delete: {
        tags: ['Viaggi (Car-Sharing)'],
        summary: 'Elimina un viaggio dal database',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del viaggio da eliminare',
            schema: { type: 'string' }
          }
        ],
        responses: {
          '200': {
            description: 'Viaggio eliminato con successo',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Viaggio eliminato' }
                  }
                }
              }
            }
          },
          '404': { description: 'Viaggio non trovato' }
        }
      }
    },
    '/api/trips/{id}/book': {
      post: {
        tags: ['Viaggi (Car-Sharing)'],
        summary: 'Prenota un posto su un passaggio auto',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del viaggio',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'userName'],
                properties: {
                  userId: { type: 'string', example: '65e21a8f9b1c2d001a3f4e5b' },
                  userName: { type: 'string', example: 'Luca Bianchi' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Prenotazione confermata',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Prenotazione confermata!' },
                    trip: { $ref: '#/components/schemas/Trip' }
                  }
                }
              }
            }
          },
          '400': { description: 'Posti esauriti, viaggio proprio o già prenotato' },
          '404': { description: 'Viaggio non trovato' }
        }
      }
    },
    '/api/trips/{id}/cancel-booking': {
      post: {
        tags: ['Viaggi (Car-Sharing)'],
        summary: 'Annulla la prenotazione di un passeggero',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del viaggio',
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: { type: 'string', example: '65e21a8f9b1c2d001a3f4e5b' }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Prenotazione annullata e posto ripristinato',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: 'Prenotazione annullata.' }
                  }
                }
              }
            }
          },
          '400': { description: 'Utente non presente tra i passeggeri' },
          '404': { description: 'Viaggio non trovato' }
        }
      }
    }
  }
};

const swaggerOptions = {
  swaggerDefinition,
  apis: []
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

function setupSwagger(app) {
  if (app && typeof app.use === 'function') {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }
}

setupSwagger.serve = swaggerUi.serve;
setupSwagger.setup = swaggerUi.setup(swaggerSpec);
setupSwagger.swaggerSpec = swaggerSpec;

module.exports = setupSwagger;
