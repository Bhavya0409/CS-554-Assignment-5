const express = require('express');
const Promise = require('bluebird');
const cache = Promise.promisifyAll(require('express-redis-cache')());
const getById = require('./dataModule.js');

const app = express();

app.get('/api/people/history', async (req, res) => {
  const cachedHistory = await cache.getAsync('history');
  const cachedHistoryUsers = getCachedField(cachedHistory, 'history');
  res.send(cachedHistoryUsers.slice(0, 20));
});

app.get('/api/people/:id', async (req, res) => {

  const id = parseInt(req.params.id);
  const cacheRes = await cache.getAsync('users');

  const cachedUsers = getCachedField(cacheRes, 'users');
  if (cachedUsers === undefined) {
    // no users in cache, so make a new entry
    try {
      const user = await getById(id);
      await cache.addAsync('users', JSON.stringify({users: [user]}));
      await cache.addAsync('history', JSON.stringify({history: [user]}));

      res.send(user);
    } catch (e) {
      res.status(404).send({error: `Couldn't find a user with id: ${id}`});
    }

  } else {
    // cached users exist
    const user = cachedUsers.find((user) => {
      return user.id === id;
    });

    if (user === undefined) {
      // couldn't find user in cache so look for user in mockData
      try {
        const user = await getById(id);
        cachedUsers.push(user);
        await cache.addAsync('users', JSON.stringify({users: cachedUsers}));

        const cachedHistory = await cache.getAsync('history');
        const cachedHistoryUsers = getCachedField(cachedHistory, 'history');
        cachedHistoryUsers.unshift(user);
        await cache.addAsync('history', JSON.stringify({history: cachedHistoryUsers}));

        res.send(user);
      } catch (e) {
        res.status(404).send({error: `Couldn't find a user with id: ${id}`});
      }

    } else {
      // found user, so add to history and return user
      const cachedHistory = await cache.getAsync('history');
      const cachedHistoryUsers = getCachedField(cachedHistory, 'history');
      cachedHistoryUsers.unshift(user);
      await cache.addAsync('history', JSON.stringify({history: cachedHistoryUsers}));

      res.send(user);
    }
  }

});

/**
 * Helper function to get specific json object field from cache, or undefined if the object doesnt exist in cache
 */
function getCachedField(cacheRes, field) {
  if (cacheRes.length === 0) {
    return undefined;
  }
  return JSON.parse(cacheRes[0].body)[field];
}

app.listen(3000, () => console.log(`Example app listening on port 3000!`))