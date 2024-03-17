const users = require('../models/userModel')
const product = require('../models/productModel')
const orders = require('../models/orderModel')
const category = require('../models/categoryModel')
var moment = require('moment')
const {generateSalesPDF} = require('../util/saledPdfCreater')
const { format } = require("date-fns");



module.exports = {
   adminDashboard: async (req, res) => {
      try {
         console.log('rendering admin dashboard');

         const [sales, revenue, customers, recentOrders, topSelling,topSellCategory] = await Promise.all([
            orders.aggregate([
               { $match: { orderStatus: "Order Delivered" } },
               { $group: { _id: null, totalSalesCount: { $sum: 1 } } }
            ]),
            orders.aggregate([
               { $match: { paymentStatus: "paid" } },
               { $group: { _id: null, totalDiscountAmount: { $sum: "$totalAmount" } } }
            ]),
            users.find().countDocuments(),
            orders.find().sort({ orderDate: -1 }),
            orders.aggregate([
               { $unwind: "$products" },
               { $group: { _id: "$products.productId", totalQuantity: { $sum: "$products.quantity" } } },
               {
                  $lookup: {
                     from: "products", // Assuming your collection name is "products"
                     localField: "_id",
                     foreignField: "_id",
                     as: "productInfo"
                  }
               },
               { $sort: { totalQuantity: -1 } },
               { $limit: 5 },
               { $project: { _id: 1, totalQuantity: 1, productInfo: { $arrayElemAt: ['$productInfo', 0] } } }
            ]),
            orders.aggregate([
               { $unwind: '$products' },
               {
                  $group : {
                     _id : '$products.productId',
                     totalQuantitySold : { $sum : '$products.quantity'}
                  }
               },
               {
                  $lookup : {
                     from : 'products',
                     foreignField : '_id',
                     localField : '_id',
                     as : 'productDetails'
                  }
               },
               { $unwind: '$productDetails' },
               {
                  $group : {
                     _id : '$productDetails.category',
                     totalQuantitySold : { $sum : '$totalQuantitySold'}
                  }
               },
               { $sort: { totalQuantitySold: -1 } },
               { $limit: 1 }
            ])
         ]);

         console.log('topSelling :', topSelling);
         console.log('top selling categories :',topSellCategory);
         const bestCat = await category.findOne({_id : topSellCategory[0]._id})
         console.log('topselling category details :',bestCat);

         const totalSales = sales[0] ? sales[0].totalSalesCount : 0;
         const totalRevenue = revenue[0] ? revenue[0].totalDiscountAmount : 0;

         res.render('admin/dashboard', { totalSales, totalRevenue, customers, recentOrders, topSelling,bestCat });
      } catch (err) {
         console.log(err);
         res.status(500).send('Internal Server Error');
      }
   },

   getCount: async (req, res) => {
      try {
         console.log('Thius is my dfdfgdsf',req.url);
         const order = await orders.find(
            { orderStatus: { $nin: ["Order Rejected", "Cancelled"] } }
         )

         const orderCountsByDay = {};
         const totalAmountByDay = {};
         const orderCountsByMonthYear = {};
         const totalAmountByMonthYear = {};
         const orderCountsByYear = {};
         const totalAmountByYear = {};
         let labelsByCount;
         let labelsByAmount;


         order.forEach((order) => {

            const orderDate = moment(order.orderDate, "ddd MMM DD YYYY");
            const dayMonthYear = orderDate.format("YYYY-MM-DD");
            const monthYear = orderDate.format("YYYY-MM");
            const year = orderDate.format("YYYY");

            if (req.url === "/count-orders-by-day") {
               if (!orderCountsByDay[dayMonthYear]) {
                  orderCountsByDay[dayMonthYear] = 1;
                  totalAmountByDay[dayMonthYear] = order.totalAmount;
               } else {
                  orderCountsByDay[dayMonthYear]++;
                  totalAmountByDay[dayMonthYear] += order.totalAmount;
               }

               const ordersByDay = Object.keys(orderCountsByDay).map(
                  (dayMonthYear) => ({
                     _id: dayMonthYear,
                     count: orderCountsByDay[dayMonthYear],
                  })
               );

               const amountsByDay = Object.keys(totalAmountByDay).map(
                  (dayMonthYear) => ({
                     _id: dayMonthYear,
                     total: totalAmountByDay[dayMonthYear],
                  })
               );

               amountsByDay.sort((a, b) => (a._id < b._id ? -1 : 1));
               ordersByDay.sort((a, b) => (a._id < b._id ? -1 : 1));

               labelsByCount = ordersByDay.map((entry) =>
                  moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
               );

               labelsByAmount = amountsByDay.map((entry) =>
                  moment(entry._id, "YYYY-MM-DD").format("DD MMM YYYY")
               );

               dataByCount = ordersByDay.map((entry) => entry.count);
               dataByAmount = amountsByDay.map((entry) => entry.total);

               console.log('lksdjfkljd',dataByCount);
               console.log('dfsffsdf',dataByAmount);

            } else if (req.url === "/count-orders-by-month") {

               if (!orderCountsByMonthYear[monthYear]) {
                  orderCountsByMonthYear[monthYear] = 1;
                  totalAmountByMonthYear[monthYear] = order.totalAmount;
               } else {
                  orderCountsByMonthYear[monthYear]++;
                  totalAmountByMonthYear[monthYear] += order.totalAmount;
               }

               const ordersByMonth = Object.keys(orderCountsByMonthYear).map(
                  (monthYear) => ({
                     _id: monthYear,
                     count: orderCountsByMonthYear[monthYear],
                  })
               );
               const amountsByMonth = Object.keys(totalAmountByMonthYear).map(
                  (monthYear) => ({
                     _id: monthYear,
                     total: totalAmountByMonthYear[monthYear],
                  })
               );

               ordersByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));
               amountsByMonth.sort((a, b) => (a._id < b._id ? -1 : 1));

               labelsByCount = ordersByMonth.map((entry) =>
                  moment(entry._id, "YYYY-MM").format("MMM YYYY")
               );
               labelsByAmount = amountsByMonth.map((entry) =>
                  moment(entry._id, "YYYY-MM").format("MMM YYYY")
               );
               dataByCount = ordersByMonth.map((entry) => entry.count);
               dataByAmount = amountsByMonth.map((entry) => entry.total);

               console.log('month ;',dataByCount);
               console.log('month ;',dataByAmount);


            } else if (req.url === "/count-orders-by-year") {
               if (!orderCountsByYear[year]) {
                  orderCountsByYear[year] = 1;
                  totalAmountByYear[year] = order.totalAmount;
               } else {
                  orderCountsByYear[year]++;
                  totalAmountByYear[year] += order.totalAmount;
               }

               const ordersByYear = Object.keys(orderCountsByYear).map((year) => ({
                  _id: year,
                  count: orderCountsByYear[year],
               }));
               const amountsByYear = Object.keys(totalAmountByYear).map((year) => ({
                  _id: year,
                  total: totalAmountByYear[year],
               }));

               ordersByYear.sort((a, b) => (a._id < b._id ? -1 : 1));
               amountsByYear.sort((a, b) => (a._id < b._id ? -1 : 1));

               labelsByCount = ordersByYear.map((entry) => entry._id);
               labelsByAmount = amountsByYear.map((entry) => entry._id);
               dataByCount = ordersByYear.map((entry) => entry.count);
               dataByAmount = amountsByYear.map((entry) => entry.total);

               console.log('year :',labelsByCount);
               console.log('year :',labelsByAmount);
               console.log('year :',dataByCount);
               console.log('year :',dataByAmount);
            }
         })

         res.json({ labelsByCount, labelsByAmount, dataByCount, dataByAmount });

      } catch (error) {
         console.log(error);
      }
   },


   downloadSalesReport: async(req,res) => {
      try {
         const { startdate, enddate, downloadformat } = req.body
         let startDate = new Date(startdate)
         let endDate = new Date(enddate)
         endDate.setHours(23, 59, 59, 999);
         const order = await orders.find(
             { paymentStatus: "paid", orderDate: { $gte: startDate, $lte: endDate, } }).populate("products.productId");

         if(downloadformat == 'pdf'){
             const pdfBuffer = await generateSalesPDF(order, startDate, endDate);

             // Set headers for the response
             res.setHeader("Content-Type", "application/pdf");
             res.setHeader(
                 "Content-Disposition",
                 "attachment; filename=sales Report.pdf"
             );

             res.status(200).end(pdfBuffer);
         }else{

             let totalSales = 0;

             order.forEach((order) => {
                 totalSales += order.discountAmount || 0;
             });

             pdf.downloadReport(
                 req,
                 res,
                 order,
                 startDate,
                 endDate,
                 totalSales.toFixed(2),
                 downloadformat
             );
         }

     } catch (error) {
         console.log(error);


     }
   }

}