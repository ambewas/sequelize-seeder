const Promise = require("bluebird");

function seeder(seeds) {
	return Promise.each(seeds, (seed) => {
		return Promise.each(seed.data, (item) => {
			return seed.model.create(item).then(async instance => {
				// run methods on instance
				if (seed.methods) {
					for (const method of seed.methods) {
						const data = await method.getData();
						instance[method.name](data);
					}
				}
			});
		});
	});
};


/**
|--------------------------------------------------
| simple seeder example
|--------------------------------------------------
*/

// simple seeder
const data = [...Array(8)].map(() => ({
	name: faker.random.word(),
	acronym: faker.random.word(),
}));

const simpleSeed = {
	data,
	model: SequelizeModel,
};

await seeder([simpleSeed]);


/**
|--------------------------------------------------
| complex seeder example with async data getters and methods for join tables
|--------------------------------------------------
*/
const getSomeUuid = async() => {
  const someInstance = await SequelizeModel.findOne();
  const someUuid = someInstance.dataValues.uuid;

  return someUuid;
};

const getData = () => {
  const aUuid = getSomeUuid();

	return [...Array(20)].map(() => {
		return {
			name: faker.company.companyName(),
			aUuid,
		};
	});
};

const complexSeed = {
	getData: getData,
  model: Rsz,
  methods: [
    // these are the utility methods sequelize provides for belongsToMany, for example
		{ name: "setJoinedModel", getData: getSomeUuid },
	],
};

// execute the seeder
await seeder(
  [
    {
      data: complexSeed.getData(),
      model: complexSeed.model,
      methods: complexSeed.methods,
    },
  ]
)