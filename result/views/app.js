var socket = io.connect({
  transports: ["polling"]
})

Vue.use(VueCharts)
var result = new Vue({
  el: "#app",
  data: {
    chartBind: true,
    chartWidth: 600,
    chartHeight: 600,
    chartScale: false,
    chartLabels: [],
    chartData: [],
    countString: ""
  },
  methods: {
    updateLabels: function(newLabels) {
      if (!compareArrays(newLabels, this.chartLabels))
        this.chartLabels = newLabels
    },
    updateData: function(newData) {
      if (!compareArrays(newData, this.chartData))
        this.chartData = newData
    },
    updateCount: function(newCount) {
      if (newCount == 0)
        this.countString = "Keine Stimmen abgegeben."
      else if (newCount == 1)
        this.countString = "Eine Stimme abgegeben."
      else
        this.countString = newCount + " Stimmen abgegeben."
    }
  }
})

var updateScores = () => {
  socket.on('scores', function(json) {
    data = JSON.parse(json)
    keys = Object.getOwnPropertyNames(data)
    votesInt = getDataFromKeys(data, keys)

    var percentagesAndSum = getPercentages(votesInt)

    result.updateLabels(keys)
    result.updateData(percentagesAndSum.percentages)
    result.updateCount(percentagesAndSum.sum)
  })
}

socket.on('message', function(data) {
  updateScores()
})

function getDataFromKeys(data, keys) {
  var votes = []

  keys.forEach((key) => {
    votes.push[data[key]]
  })

  return votes
}

function getPercentages(array) {
  var result = {
    "percentages": [],
    "sum": 0
  }

  if (array.length > 0) {
    var sum = array.reduce((a, b) => a + b, 0)
    result.sum = sum

    array.forEach((value) => {
      result.percentages.push((value * 100 / sum).toFixed(2))
    })
  }

  return result
}

function compareArrays(a, b) {
  if (a.length != b.length)
    return false

  for (var i = 0; i < a.length; i++)
    if (a[i] != b[i])
      return false

  return true
}

function loadJSON(filePath, success, error) {
  var xhr = new XMLHttpRequest()
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success)
          success(JSON.parse(xhr.responseText))
      } else {
        if (error)
          error(xhr)
      }
    }
  }
  xhr.open("GET", filePath, true)
  xhr.send()
}
