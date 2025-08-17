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
const data = [
  { year: '2019', count: 10000, count2: 8000 },
  { year: '2020', count: 15000, count2: 12000 },
  { year: '2021', count: 25000, count2: 30000 },
  { year: '2022', count: 10000, count2: 15000 },
  { year: '2023', count: 50000, count2: 45000 }
];

new Chart(
    document.getElementById('myChart'),
    {
      type: 'line',
      options: {
        animation: false,
        plugins: {
          legend: {
            display: true
          },
          tooltip: {
            enabled: true
          }
        }
      },
      data: {
        labels: data.map(row => row.year),
        datasets: [
          {
            label: 'Total Money',
            data: data.map(row => row.count),
            segment: {
              borderColor: ctx => {
                const current = ctx.p1.parsed.y;
                const previous = ctx.p0.parsed.y;
                return current >= previous ? '#00FFBB' : '#BBFF00';
              }
            }
          },
          {
            label: 'Stock Value',
            data: data.map(row => row.count2),
            segment: {
              borderColor: ctx => {
                const current = ctx.p1.parsed.y;
                const previous = ctx.p0.parsed.y;
                return current >= previous ? '#BB00FF' : '#FF00BB';
              }
            }
          }
        ]
      }
    }
  );