const faunadb = require('faunadb');
const q = faunadb.query;

// Initialize the FaunaDB client with the secret and API version
const client = new faunadb.Client({
  secret: process.env.FAUNA_SECRET_KEY,
  apiVersion: '10'
});

/**
 * Initialize the FaunaDB database with collections and indexes
 */
async function initializeDatabase() {
  try {
    // Create collections
    await createCollection('license_keys');
    await createCollection('contact_info');
    await createCollection('contact_info_history');
    await createCollection('app_settings');
    await createCollection('settings_history');
    await createCollection('flash_transactions');
    await createCollection('users');

    // Create indexes
    await createIndex('license_keys_by_key', 'license_keys', 'key');
    await createIndex('license_keys_by_status', 'license_keys', 'status');
    await createIndex('license_keys_by_user', 'license_keys', 'user');
    await createIndex('contact_info_history_by_field', 'contact_info_history', 'field');
    await createIndex('settings_history_by_field', 'settings_history', 'field');
    await createIndex('flash_transactions_by_license_key_id', 'flash_transactions', 'license_key_id');
    await createIndex('users_by_email', 'users', 'email');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

/**
 * Create a collection if it doesn't exist
 * @param {string} name - Collection name
 */
async function createCollection(name) {
  try {
    await client.query(
      q.If(
        q.Exists(q.Collection(name)),
        true,
        q.CreateCollection({ name })
      )
    );
    console.log(`Collection ${name} created or already exists`);
  } catch (error) {
    console.error(`Error creating collection ${name}:`, error);
    throw error;
  }
}

/**
 * Create an index if it doesn't exist
 * @param {string} name - Index name
 * @param {string} collection - Collection name
 * @param {string} term - Field to index
 */
async function createIndex(name, collection, term) {
  try {
    await client.query(
      q.If(
        q.Exists(q.Index(name)),
        true,
        q.CreateIndex({
          name,
          source: q.Collection(collection),
          terms: [{ field: ['data', term] }]
        })
      )
    );
    console.log(`Index ${name} created or already exists`);
  } catch (error) {
    console.error(`Error creating index ${name}:`, error);
    throw error;
  }
}

/**
 * Create a document in a collection
 * @param {string} collection - Collection name
 * @param {object} data - Document data
 * @returns {object} Created document
 */
async function create(collection, data) {
  try {
    const result = await client.query(
      q.Create(
        q.Collection(collection),
        { data }
      )
    );
    return {
      id: result.ref.id,
      ...result.data
    };
  } catch (error) {
    console.error(`Error creating document in ${collection}:`, error);
    throw error;
  }
}

/**
 * Get all documents from a collection
 * @param {string} collection - Collection name
 * @returns {Array} Array of documents
 */
async function getAll(collection) {
  try {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Documents(q.Collection(collection))),
        q.Lambda('ref', q.Let(
          { doc: q.Get(q.Var('ref')) },
          {
            id: q.Select(['ref', 'id'], q.Var('doc')),
            ...q.Select(['data'], q.Var('doc'))
          }
        ))
      )
    );
    return result.data;
  } catch (error) {
    console.error(`Error getting all documents from ${collection}:`, error);
    throw error;
  }
}

/**
 * Get a document by ID
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {object} Document
 */
async function getById(collection, id) {
  try {
    const result = await client.query(
      q.Let(
        { doc: q.Get(q.Ref(q.Collection(collection), id)) },
        {
          id: q.Select(['ref', 'id'], q.Var('doc')),
          ...q.Select(['data'], q.Var('doc'))
        }
      )
    );
    return result;
  } catch (error) {
    console.error(`Error getting document ${id} from ${collection}:`, error);
    throw error;
  }
}

/**
 * Get documents by a field value
 * @param {string} index - Index name
 * @param {string} value - Field value
 * @returns {Array} Array of documents
 */
async function getByField(index, value) {
  try {
    const result = await client.query(
      q.Map(
        q.Paginate(q.Match(q.Index(index), value)),
        q.Lambda('ref', q.Let(
          { doc: q.Get(q.Var('ref')) },
          {
            id: q.Select(['ref', 'id'], q.Var('doc')),
            ...q.Select(['data'], q.Var('doc'))
          }
        ))
      )
    );
    return result.data;
  } catch (error) {
    console.error(`Error getting documents by field ${index}=${value}:`, error);
    throw error;
  }
}

/**
 * Update a document
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @param {object} data - Document data
 * @returns {object} Updated document
 */
async function update(collection, id, data) {
  try {
    const result = await client.query(
      q.Let(
        { doc: q.Update(q.Ref(q.Collection(collection), id), { data }) },
        {
          id: q.Select(['ref', 'id'], q.Var('doc')),
          ...q.Select(['data'], q.Var('doc'))
        }
      )
    );
    return result;
  } catch (error) {
    console.error(`Error updating document ${id} in ${collection}:`, error);
    throw error;
  }
}

/**
 * Delete a document
 * @param {string} collection - Collection name
 * @param {string} id - Document ID
 * @returns {boolean} Success
 */
async function remove(collection, id) {
  try {
    await client.query(
      q.Delete(q.Ref(q.Collection(collection), id))
    );
    return true;
  } catch (error) {
    console.error(`Error deleting document ${id} from ${collection}:`, error);
    throw error;
  }
}

/**
 * Get the latest document from a collection
 * @param {string} collection - Collection name
 * @returns {object} Latest document
 */
async function getLatest(collection) {
  try {
    const result = await client.query(
      q.Let(
        {
          docs: q.Map(
            q.Paginate(q.Documents(q.Collection(collection)), { size: 1 }),
            q.Lambda('ref', q.Get(q.Var('ref')))
          )
        },
        q.If(
          q.IsEmpty(q.Select(['data'], q.Var('docs'))),
          null,
          q.Let(
            { doc: q.Select([0], q.Select(['data'], q.Var('docs'))) },
            {
              id: q.Select(['ref', 'id'], q.Var('doc')),
              ...q.Select(['data'], q.Var('doc'))
            }
          )
        )
      )
    );
    return result;
  } catch (error) {
    console.error(`Error getting latest document from ${collection}:`, error);
    throw error;
  }
}

module.exports = {
  client,
  q,
  initializeDatabase,
  create,
  getAll,
  getById,
  getByField,
  update,
  remove,
  getLatest
};
