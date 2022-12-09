const rule = require("."),
  RuleTester = require("eslint").RuleTester;

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2020 },
});

ruleTester.run("transaction", rule.rules.transaction, {
    valid: [
        {
            code: `
async function simple() {
  const transaction = await sequelize.transaction();
  if (false) {
    await transaction.rollback()
    return
  }
  await transaction.rollback()
}`,
        },
        {
            code: `
async function withTryAndFinally() {
  const transaction = await sequelize.transaction();
  try {
    return 1
  } catch (err) {
    console.error()
  } finally {
    await transaction.rollback()
  }
}`,
        },
        {
            code: `
async function nested() {
  const transaction = await sequelize.transaction();
  {
    {
      {
        await transaction.rollback()
      }
    }
  }
}`,
        },
      {
            code: `
async function ifElse() {
  const transaction = await sequelize.transaction();
  if (123) {
    await transaction.rollback()
    return bla
  } else {
    await transaction.rollback()
  }
}`,
      }
    ],
    invalid: [
        {
            code: `
async function nestedStatements() {
  let transaction = await sequelize.transaction();
  if (3 > 2) {
    if (4 > 2) {
      return 1
    }
    await transaction.rollback()
  }
  await transaction.rollback()
}`,
            errors: [{ message: "Transaction in this context is not closed at some path." }]
        },
        {
            code: `
async function noNesting() {
  const transaction = await sequelize.transaction();

  return await 1
}`,
            errors: [{ message: "Transaction in this context is not closed at some path." }]
        },
        {
            code: `
const obj = {
  func: async function () {
    const transaction = await sequelize.transaction();

    return await 1
  }
}`,
            errors: [{ message: "Transaction in this context is not closed at some path." }]
        },
        {
            code: `
const obj = {
  arrow: () => {
    const transaction = await sequelize.transaction();

    return await 1
  }
}`,
            errors: [{ message: "Transaction in this context is not closed at some path." }]
        },
    ]
});
