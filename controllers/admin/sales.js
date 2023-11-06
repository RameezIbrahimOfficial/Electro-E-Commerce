const moment = require("moment");
const Excel = require("exceljs");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const {orderModel} = require('../../Model')
const {filterOrdersForMonth, filterOrdersForYear, filterOrdersForWeek} = require("../../helpers");

const getSalesReportPage = async (req, res) => {
    try {
        const sales = await orderModel.find({ orderStatus: "Delivered" }).populate({
            path: "products.productId",
            model: "Product",
        });
        res.render("page-sales-report", { sales, moment });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const getMonthWeekYearSales = async (req, res) => {
    try {

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const currentWeek = Math.ceil(currentDate.getDate() / 7);

        let orders = await orderModel.find({ orderStatus: "Delivered" });
        orders = await orderModel.populate(orders, {
            path: "products.productId",
            model: "Product",
        });

        const ordersThisYear = filterOrdersForYear(orders, currentYear);
        const ordersThisMonth = filterOrdersForMonth(
            orders,
            currentYear,
            currentMonth
        );
        const ordersThisWeek = filterOrdersForWeek(
            orders,
            currentYear,
            currentMonth,
            currentWeek
        );

        if (req.query.saleDate === "Month") {
            res.render("page-sales-report", { sales: ordersThisMonth, moment });
        }

        if (req.query.saleDate === "Week") {
            res.render("page-sales-report", { sales: ordersThisWeek, moment });
        }

        if (req.query.saleDate === "Year") {
            res.render("page-sales-report", { sales: ordersThisYear, moment });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred");
    }
};

const salesReportExcel = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ orderStatus: "Delivered" })
            .populate({
                path: "products.productId",
                model: "Product",
            })
            .populate({
                path: "customerId",
                model: "Customers",
            });
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet("sales report");
        const salesReportColumns = [
            { key: "orderId", header: "Order ID" },
            { key: "customerName", header: "Customer Name" },
            { key: "customerEmail", header: "Customer Email" },
            { key: "productDetails", header: "Product Details" },
            { key: "address", header: "Customer Address" },
            { key: "shippingCharge", header: "Shipping Charge" },
            { key: "discount", header: "Discount" },
            { key: "couponCode", header: "Coupon Code" },
            { key: "totalAmount", header: "Total Amount" },
            { key: "createdOn", header: "Order Date" },
            { key: "orderStatus", header: "Order Status" },
            { key: "paymentMethod", header: "Payment Method" },
            { key: "paymentStatus", header: "Payment Status" },
            { key: "deliveredOn", header: "Delivered Date" },
        ];
        worksheet.columns = salesReportColumns;

        orders.forEach((order) => {
            order.products.forEach((product) => {
                const salesData = {
                    orderId: order.referenceId,
                    customerName: order.customerId.firstName,
                    customerEmail: order.customerId.email,
                    productDetails: `${product.productId.productName}, Price: ${product.price}, Quantity: ${product.quantity}`,
                    address: order.address,
                    shippingCharge: order.shippingCharge,
                    discount: order.discount,
                    couponCode: order.couponCode,
                    totalAmount: order.totalAmount,
                    createdOn: order.createdOn,
                    orderStatus: order.orderStatus,
                    paymentMethod: order.paymentMethod,
                    paymentStatus: order.paymentStatus,
                    deliveredOn: order.deliveredOn,
                };
                worksheet.addRow(salesData);
            });
        });

        worksheet.columns.forEach((sheetColumn) => {
            sheetColumn.font = {
                size: 12,
            };
            sheetColumn.width = 30;
        });

        worksheet.getRow(1).font = {
            bold: true,
            size: 13,
        };
        const filePath = path.join(__dirname, "sales_report.xlsx");
        const exportPath = path.resolve(
            __dirname,
            "..",
            "..",
            "Public",
            "sales-report",
            "sales_report.xlsx"
        );
        await workbook.xlsx.writeFile(exportPath);
        res.download(exportPath, "sales_report.xlsx", (err) => {
            if (err) {
                res.status(500).send("Error sending the file");
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

const salesReportPdf = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ orderStatus: "Delivered" })
            .populate({
                path: "products.productId",
                model: "Product",
            })
            .populate({
                path: "customerId",
                model: "Customers",
            });

        const doc = new PDFDocument();
        const filePath = path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "sales-report",
            "sales_report.pdf"
        );
        doc.pipe(fs.createWriteStream(filePath));
        doc.fillColor("red");
        doc.text("SALES REPORT");
        doc.fillColor("black");

        doc.moveDown();
        orders.forEach((order) => {
            order.products.forEach((product) => {
                doc.moveDown();
                doc.fillColor("green");
                doc.text("NEW ORDER");
                doc.fillColor("black");
                doc.moveDown();

                const salesDataString = `
  Order ID: ${order.referenceId}
  Customer Name: ${order.customerId.firstName}
  Customer Email: ${order.customerId.email}
  Product Details: ${product.productId.productName}, Price: ${product.price}, Quantity: ${product.quantity}
  Address: ${order.address}
  Shipping Charge: ${order.shippingCharge}
  Discount: ${order.discount}
  Coupon Code: ${order.couponCode}
  Total Amount: ${order.totalAmount}
  Created On: ${order.createdOn}
  Order Status: ${order.orderStatus}
  Payment Method: ${order.paymentMethod}
  Payment Status: ${order.paymentStatus}
  Delivered On: ${order.deliveredOn}
  `;

                doc.text(salesDataString);
            });
        });

        doc.end();

        res.download(filePath, "sales_report.pdf", (err) => {
            if (err) {
                res.status(500).send("Error sending the file");
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error generating sales report");
    }
};

module.exports = {
    getSalesReportPage,
    getMonthWeekYearSales,
    salesReportExcel,
    salesReportPdf
}