'use strict';
const uuid = require('uuid');
const AWS = require('aws-sdk'); 
AWS.config.setPromisesDependency(require('bluebird'));
const dynamoDb = new AWS.DynamoDB.DocumentClient();
module.exports.add = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const name = requestBody.name;
  const email = requestBody.email;
  if (typeof name !== 'string' || typeof email !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit employee because of validation errors.'));
    return;
  }
  submitEmployeeP(employeeInfo(name, email))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted employee with name ${name} and email ${email}`,
          employeeId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit employee with name ${name} and email ${email}`,
        })
      })
    });
};

module.exports.list = (event, context, callback) => {
  var params = {
      TableName: process.env.EMPLOYEE_TABLE,
      ExpressionAttributeNames: {"#name": "name"},
      ProjectionExpression: "id, #name, email"
  };
  console.log("Scanning Employee table.");
  const onScan = (err, data) => {
      if (err) {
          console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
          callback(err);
      } else {
          console.log("Scan succeeded.");
          
      return callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({
            employees: data.Items
          })
      });
      }
  };
  dynamoDb.scan(params, onScan);
};

module.exports.delete = (event, context, callback) => {
  // const requestBody = JSON.parse(event.body);
  var params = {
      TableName: process.env.EMPLOYEE_TABLE,
      Key: {
        id: event.pathParameters.id,
      },
  };
  console.log("Deleting employee from Employee table.");
  const onDelete = (err, data) => {
      if (err) {
          console.log('Failed to delete. Error JSON:', JSON.stringify(err, null, 2));
          return callback(err);
      } else {
          console.log("Delete succeeded.");
          return callback(null, {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin": "*"
            }
          });
      }
  };
  dynamoDb.delete(params, onDelete);
}

// helper functions
const submitEmployeeP = employee => {
  console.log('Submitting employee');
  const employeeInfo = {
    TableName: process.env.EMPLOYEE_TABLE,
    Item: employee,
  };
  return dynamoDb.put(employeeInfo).promise()
    .then(res => employee);
};
// structures name and email into JSON, and adds some timestamp metadata
const employeeInfo = (name, email) => {
  const timestamp = new Date().getTime();
  return {
    id: uuid.v1(),
    name: name,
    email: email,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};