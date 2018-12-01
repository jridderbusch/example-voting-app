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
    chartBackgroundColor: [
      "rgba(33, 150, 243, 0.3)",
      "rgba(0, 203, 202, 0.3)",
      "rgba(9, 205, 81, 0.3)"
    ],
    chartHoverBackgroundColor: [
      "rgba(33, 150, 243, 1)",
      "rgba(0, 203, 202, 1)",
      "rgba(9, 205, 81, 1)"
    ],
    chartBorderColor: [
      "rgba(33, 150, 243, 1)",
      "rgba(0, 203, 202, 1)",
      "rgba(9, 205, 81, 1)"
    ],
    countString: ""
  },
  methods: {
    updateLabels(newLabels) {
        if (!compareArrays(newLabels, this.chartLabels))
          this.chartLabels = newLabels
      },
      updateData(newData) {
        if (!compareArrays(newData, this.chartData))
          this.chartData = newData
      },
      updateCount(newCount) {
        if (newCount == 0)
          this.countString = "Keine Stimmen abgegeben."
        else if (newCount == 1)
          this.countString = "Eine Stimme abgegeben."
        else
          this.countString = newCount + " Stimmen abgegeben."
      }
  }
})

loadJSON("appsettings.json", (object) => {
  result.updateLabels(object.options)
})

var updateScores = () => {
  socket.on('scores', function(json) {
    data = JSON.parse(json)
    var a = parseInt(data.a || 0)
    var b = parseInt(data.b || 0)
    var c = parseInt(data.c || 0)

    var percentagesAndSum = getPercentages([a, b, c])

    result.updateData(percentagesAndSum.percentages)
    result.updateCount(percentagesAndSum.sum)
  })
}

socket.on('message', function(data) {
  updateScores()
})

function getPercentages(array) {
  var result = {
    "percentages": [],
    "sum": 0
  }

  if (array.length > 0) {
    var sum = array.reduce((a, b ) => a + b, 0)
    result.sum = sum

    for (var i = 0; i < array.length; i++)
      result.percentages.push(array[i] * 100 / sum)
  } else {
    result.percentages = [50, 50]
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
      }
      else {
        if (error)
          error(xhr)
      }
    }
  }
  xhr.open("GET", filePath, true)
  xhr.send()
}
