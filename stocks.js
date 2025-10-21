document.addEventListener("DOMContentLoaded", (event) => {
    showContent()
})

function showContent() {
  const items = document.querySelectorAll(".item");
  const animationDelay = 100;

  items.forEach((item, index) => {
    setTimeout(() => {
      item.style.opacity = 1;
      item.style.transform = "translateY(0px)";
    }, index * animationDelay);
  });
}

//Chart.js configuration

// Sample data
var data = [
  { year: '2019', count: 10000, count2: 8000 },
  { year: '2020', count: 15000, count2: 12000 },
  { year: '2021', count: 25000, count2: 30000 },
  { year: '2022', count: 10000, count2: 15000 },
  { year: '2023', count: 50000, count2: 45000 }
];

var options = {
  maintainAspectRatio: false,
  animation: false,
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            enabled: true
          }
        }
}

new Chart(
    document.getElementById('myChart'),
    {
      type: 'line',
      options: options,
      data: {
        labels: data.map(row => row.year),
        datasets: [
          {
            label: 'Total Money',
            borderColor: '#00FFAA',
            backgroundColor: '#00AABB',
            data: data.map(row => row.count),
            segment: {
              borderColor: ctx => {
                const current = ctx.p1.parsed.y;
                const previous = ctx.p0.parsed.y;
                return current >= previous ? '#00FFAA' : '#00AABB';
              }
            }
          },
          {
            label: 'Stock Value',
            borderColor: '#FF00BB',
            backgroundColor: '#BB00FF',
            data: data.map(row => row.count2),
            segment: {
              borderColor: ctx => {
                const current = ctx.p1.parsed.y;
                const previous = ctx.p0.parsed.y;
                return current >= previous ? '#FF00BB' : '#BB00FF';
              }
            }
          }
        ]
      }
    }
  );


  new Chart(
    document.getElementById('stockChart'),
    {
      type: 'line',
      options: options,
      data: {
        labels: data.map(row => row.year),
        datasets: [
          {
            label: 'Portfolio Value',
            borderColor: '#00FFAA',
            backgroundColor: '#00AABB',
            data: data.map(row => row.count2 + row.count),
            segment: {
              borderColor: ctx => {
                const current = ctx.p1.parsed.y;
                const previous = ctx.p0.parsed.y;
                return current >= previous ? '#00FFAA' : '#00AABB';
              }
            }
          }
        ]
      }
    }
  );
  //index js

  function href(url) {
  window.location.href = url;
}