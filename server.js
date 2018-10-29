const express = require('express');
const app = express();
const cache = require('express-redis-cache')();
const getById = require('./dataModule.js');

app.get('/api/people/history', (req, res) => {
  console.log('history route hit');
  res.send('history route');
});

app.get('/api/people/:id', (req, res) => {

  let {id} = req.params;
  id = parseInt(id);

  cache.get('users', async (err, cacheRes) => {
    if (err) {
      console.log('error');
      res.send('something broke')
    } else {
      console.log('got cacheRes', cacheRes);
      const cachedUsers = getCachedUsers(cacheRes);
      console.log('cachedUsers', cachedUsers);
      if (cachedUsers === undefined) {
        // no users in cache, so make a new entry
        console.log('couldnt find any users in cache');
        const user = await getById(id);
        const newUsersObject = {
          users: [user]
        }

        cache.add('users', JSON.stringify(newUsersObject), (err, add) => {
          if (err) {
            throw err;
          } else {
            console.log('added!', add);
            res.send(user);
          }
        });

      } else {
        // cached users exist
        const user = cachedUsers.find((user) => {
          return user.id === id;
        });

        if (user === undefined) {
          // couldn't find user in cache -> look for user in mockData
          const user = await getById(id);

          cachedUsers.push(user);
          console.log('new cached Users before putting in cache', cachedUsers);
          const newUsersObject = {
            users: cachedUsers
          }
          console.log('new users object', newUsersObject);
          cache.add('users', JSON.stringify(newUsersObject), (err, add) => {
            if (err) {
              throw err;
            } else {
              console.log('added!', add);
              res.send(user);
            }
          });
        } else {
          // found user - >return user
          console.log('found user in cache', cacheRes);
          res.send(user);
        }
      }
    }
  })
});

function getCachedUsers(cacheRes) {
  if (cacheRes.length === 0) {
    return undefined;
  }
  return JSON.parse(cacheRes[0].body).users;
}

// if (err) {
//   throw err;
// } else {
//   console.log('cache is', cacheRes);
//   if (cacheRes.users === undefined) {
//      no users in cache, so make a new entry
//     console.log('couldnt find any users in cache');
//     const user = await getById(id);
//     const newUsersObject = {
//       users: [user]
//     }
//     cache.add('users', JSON.stringify(newUsersObject), (err, add) => {
//       if (err) {
//         throw err;
//       } else {
//         console.log('added!', add);
//         res.send(user);
//       }
//     });
//   } else {
//     const users = cacheRes.users;
//     const user = users.find((user) => {
//       return user.id === id;
//     })
//
//     if (user === undefined) {
//        couldn't find user in cache -> look for user in mockData
//       const user = await getById(id);
//
//       const newUsers = users.push(user);
//       const newUsersObject = {
//         users: newUsers
//       }
//       console.log('new users object', newUsersObject);
//       cache.add('users', JSON.stringify(newUsersObject), (err, add) => {
//         if (err) {
//           throw err;
//         } else {
//           console.log('added!', add);
//           res.send(user);
//         }
//       });
//     } else {
//        found user - >return user
//       console.log('found user in cache', cacheRes);
//       res.send(user);
//     }
//   }
// }

app.listen(3000, () => console.log(`Example app listening on port 3000!`))