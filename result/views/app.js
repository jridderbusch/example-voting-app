google.charts.load('current', {
	'packages': ['corechart']
});

var app = new Vue({
	el: '#app',
	data: {
		options: [],
		votes: {},
		dataTable: [],
	},
	methods: {
		create: function () {
			fetch('/options', {
					method: 'GET'
				})
				.then(res => {
					return res.json()
				})
				.then(options => {
					this.options = options
					this.update()
				})
				.catch(e => console.log(e))
		},
		update: function () {
			fetch('/result', {
					method: 'GET'
				})
				.then(res => {
					return res.json()
				})
				.then(votes => {
					this.votes = votes
					this.dataTable = this.buildData()
					drawVotes(this.dataTable)
					setTimeout(() => this.update(), 1000)
				})
				.catch(e => console.log(e))
		},
		buildData: function () {
			var data = [
				['Votes', 'Percent']
			]
			var voteKeys = Object.keys(this.votes).sort()
			for (i = 0; i < this.options.length; i++) {
				data.push([this.options[i], this.votes[voteKeys[i]]])
			}
			return data
		}

	},
});

google.charts.setOnLoadCallback(app.create);

function drawVotes(table) {
	var data = google.visualization.arrayToDataTable(table);
	var options = {
		colors: ['#2196f3', '#00cbca'],
		legend: {
			position: 'top',
			alignment: 'center'
		}
	};
	var chart = new google.visualization.PieChart(document.getElementById('piechart'));
	chart.draw(data, options);
}
