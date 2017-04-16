var permissions = {
	d1: {
		INCLUDE: ["india", "united states"],
		EXCLUDE: ["karnataka,india", "chennai,tamil nadu,india"],
		superDistributor: false
	},
	d2: {
		INCLUDE: ["india"],
		EXCLUDE: ["tamil nadu,india"],
		superDistributor: "d1"
	}
}
module.exports = permissions;
