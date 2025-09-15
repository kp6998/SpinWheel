const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");
//Object that stores values of minimum and maximum angle for a value
const rotationValues = [
  { minDegree: 0, maxDegree: 30, value: getProductName(2) },
  { minDegree: 31, maxDegree: 90, value: getProductName(1) },
  { minDegree: 91, maxDegree: 150, value: getProductName(6) },
  { minDegree: 151, maxDegree: 210, value: getProductName(5) },
  { minDegree: 211, maxDegree: 270, value: getProductName(4) },
  { minDegree: 271, maxDegree: 330, value: getProductName(3) },
  { minDegree: 331, maxDegree: 360, value: getProductName(2) },
];
function getProductName(i) {
  const products = JSON.parse(localStorage.getItem('products')) || [];
  if (products.length > 0) {
    const prod = products.find(p => p.id === i);
    return prod ? prod.name : i;
  } else {
    return i;
  }
}
//Size of each piece
const data = [16, 16, 16, 16, 16, 16];
//background color for each piece
var pieColors = [
  "#8b35bc",
  "#b163da",
  "#8b35bc",
  "#b163da",
  "#8b35bc",
  "#b163da",
];
//Create chart
let myChart = new Chart(wheel, {
  //Plugin for displaying text on pie chart
  plugins: [ChartDataLabels],
  //Chart Type Pie
  type: "pie",
  data: {
    //Labels(values which are to be displayed on chart)
    labels: [getProductName(1), getProductName(2), getProductName(3), getProductName(4), getProductName(5), getProductName(6)],
    //Settings for dataset/pie
    datasets: [
      {
        backgroundColor: pieColors,
        data: data,
      },
    ],
  },
  options: {
    //Responsive chart
    responsive: true,
    animation: { duration: 0 },
    plugins: {
      //hide tooltip and legend
      tooltip: false,
      legend: {
        display: false,
      },
      //display labels inside pie chart
      datalabels: {
        color: "#ffffff",
        formatter: (_, context) => context.chart.data.labels[context.dataIndex],
        font: { size: 24 },
      },
    },
  },
});

//display value based on the randomAngle
const valueGenerator = (angleValue) => {
  let products = [];
  try {
    products = JSON.parse(localStorage.getItem('products')) || [];
  } catch (e) { }
  for (let i of rotationValues) {
    if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
      // Find product with id === i.value
      const prodIdx = products.findIndex(p => getProductName(i.value) === p.name);
      if (prodIdx !== -1) {
        const prod = products[prodIdx];
        finalValue.innerHTML = `<p>Product: ${prod.name}</p>`;
        // Check if all counts are 0
        if (products.length > 0 && products.every(p => p.count === 0)) {
          if (window.showGameOverModal) window.showGameOverModal();
        } else {
          // Show victory modal only if not all zero
          if (window.showVictoryModal) window.showVictoryModal(prod.name);
        }
        // Reduce count by 1 if count > 0
        if (prod.count > 0) {
          prod.count -= 1;
          products[prodIdx] = prod;
          localStorage.setItem('products', JSON.stringify(products));
        }
      } else {
        finalValue.innerHTML = `<p>Product: (not found)</p>`;
      }
      spinBtn.disabled = false;
      break;
    }
  }
};

//Spinner count
let count = 0;
//100 rotations for animation and last rotation for result
let resultValue = 101;
//Start spinning
spinBtn.addEventListener("click", () => {
  spinBtn.disabled = true;
  finalValue.innerHTML = `<p>Good Luck!</p>`;

  // Find product with highest count
  let products = [];
  try {
    products = JSON.parse(localStorage.getItem('products')) || [];
  } catch (e) { }
  let maxCount = Math.max(...products.map(p => p.count));
  let topProducts = products.filter(p => p.count === maxCount);
  // If multiple, pick the first
  let topProduct = topProducts[0];
  // Find the id of the top product
  let topId = topProduct ? topProduct.id : 1;

  // Find the angle range for this id in rotationValues
  let targetRange = rotationValues.find(r => {
    // r.value is a name or id, so match by id
    return getProductName(r.value) === getProductName(topId);
  });
  // Pick a random angle within the target range
  let randomDegree = targetRange
    ? Math.floor(Math.random() * (targetRange.maxDegree - targetRange.minDegree + 1)) + targetRange.minDegree
    : 0;

  let selectedProductName = getProductName(topId);
  let rotationInterval = window.setInterval(() => {
    myChart.options.rotation = myChart.options.rotation + resultValue;
    myChart.update();
    if (myChart.options.rotation >= 360) {
      count += 1;
      resultValue -= 5;
      myChart.options.rotation = 0;
    } else if (count > 15 && myChart.options.rotation == randomDegree) {
      valueGenerator(randomDegree);
      clearInterval(rotationInterval);
      count = 0;
      resultValue = 101;
      // Show victory modal after spinner stops
      // Only show if not all counts are zero
      let updatedProducts = [];
      try {
        updatedProducts = JSON.parse(localStorage.getItem('products')) || [];
      } catch (e) { }
      if (updatedProducts.length > 0 && !updatedProducts.every(p => p.count === 0)) {
        if (window.showVictoryModal) window.showVictoryModal(selectedProductName);
      }
    }
  }, 10);
});