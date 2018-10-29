const express = require('express');
const Promise = require('bluebird');
const cache = Promise.promisifyAll(require('express-redis-cache')());
const getById = require('./dataModule.js');

const app = express();

app.get('/api/people/history', (req, res) => {
  console.log('history route hit');
  res.send('history route');
});

app.get('/api/people/:id', (req, res) => {

  let {id} = req.params;
  id = parseInt(id);

  cache.getAsync('users').then(async (cacheRes) => {
    const cachedUsers = getCachedUsers(cacheRes);
    if (cachedUsers === undefined) {
      // no users in cache, so make a new entry
      const user = await getById(id);

      cache.add('users', JSON.stringify({users: [user]}), (err, add) => {
        if (err) {
          throw err;
        } else {
          // added user to cache, so send user back
          res.send(user);
        }
      });

    } else {
      // cached users exist
      const user = cachedUsers.find((user) => {
        return user.id === id;
      });

      if (user === undefined) {
        // couldn't find user in cache so look for user in mockData
        const user = await getById(id);
        cachedUsers.push(user);
        cache.add('users', JSON.stringify({users: cachedUsers}), (err, add) => {
          if (err) {
            throw err;
          } else {
            res.send(user);
          }
        });
      } else {
        // found user - >return user
        res.send(user);
      }
    }
  }).catch(err => {
    throw err;
  })

});

/**
 * Helper function to get users json object from cache, or undefined if users object doesnt exist in cache
 */
function getCachedUsers(cacheRes) {
  if (cacheRes.length === 0) {
    return undefined;
  }
  return JSON.parse(cacheRes[0].body).users;
}

app.listen(3000, () => console.log(`Example app listening on port 3000!`))