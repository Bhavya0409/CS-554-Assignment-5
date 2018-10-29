const fs = require('fs');

/**
 * Find user from "database" given id
 */
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

        if (user) {
          resolve(user);
        } else {
          reject()
        }
      })
    }, 1000);
  });
};

module.exports = getById;