const fs = require('fs');

function getById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      fs.readFile('mockData.json', 'utf-8', (err, res) => {
        if (err) {
          throw err;
        }
        const data = JSON.parse(res);
        const user = data.find((user) => {
          return user.id === id;
        })
        console.log('couldnt find user in cache, so searched json and found:', user);

        if (user) {
          resolve(user);
        } else {
          reject(new Error("something went wrong"))
        }
      })
    }, 1000);
  });
};

module.exports = getById;

/**
 * Step 1: User goes to /api/people/:id
 * Step 2: Redis cache is checked to see if user with id has logged in (exists in cache)
 * Step 3a: If exists, then return that data
 * Step 3b: If does not exist, then go go into getById function and look for User
 * Step 4a: If does not exist, then return failure
 * Step 4b: If exists, then save the data in the cacher and return that data set
 * Step 5: Add this user to a list of logged in users
 * Step 6: Display data
 *
 * Step 7: User goes to /api/people/history
 * Step 8: Go into redis cache and list the last 20 people that have logged in, with most recent on top
 */