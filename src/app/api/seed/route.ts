import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  // Simple secret check to prevent unauthorized seeding
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  if (secret !== "opersis-seed-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if already seeded
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json({ message: "Database already seeded", users: existingUsers });
    }

    // Create users
    const adminPass = await bcrypt.hash("admin123", 12);
    const managerPass = await bcrypt.hash("manager123", 12);
    const viewerPass = await bcrypt.hash("viewer123", 12);

    const admin = await prisma.user.upsert({
      where: { email: "admin@opersis.com" },
      update: {},
      create: {
        email: "admin@opersis.com",
        name: "Admin User",
        password: adminPass,
        role: "ADMIN",
      },
    });

    const manager = await prisma.user.upsert({
      where: { email: "manager@opersis.com" },
      update: {},
      create: {
        email: "manager@opersis.com",
        name: "IT Manager",
        password: managerPass,
        role: "IT_MANAGER",
      },
    });

    const viewer = await prisma.user.upsert({
      where: { email: "viewer@opersis.com" },
      update: {},
      create: {
        email: "viewer@opersis.com",
        name: "Viewer User",
        password: viewerPass,
        role: "VIEWER",
      },
    });

    // Create System Assets
    const assets = await Promise.all([
      prisma.systemAsset.create({
        data: {
          assetTag: "NCPL-LAP-001",
          productName: "Dell Latitude 5540",
          serialNumber: "DL5540-2024-001",
          make: "Dell",
          config: "i7-1365U, 16GB RAM, 512GB SSD",
          osVersion: "Windows 11 Pro",
          company: "NCPL",
          department: "IT Department",
          location: "Ahmedabad",
          vendorDetails: "Dell Technologies India",
          purchaseDate: new Date("2024-01-15"),
          invoiceNumber: "INV-DELL-2024-001",
          cost: 89500,
          warrantyPeriod: "3 Years",
          warrantyExpiry: new Date("2027-01-15"),
          status: "ACTIVE",
          assignedUserId: manager.id,
          phone: "+91 9876543210",
          emailId: "manager@opersis.com",
          officeAppId: "MS365-MGR-001",
          softwareInstalled: "MS Office 365, Chrome, VS Code, Slack",
        },
      }),
      prisma.systemAsset.create({
        data: {
          assetTag: "NCPL-LAP-002",
          productName: "HP EliteBook 840 G10",
          serialNumber: "HP840G10-2024-002",
          make: "HP",
          config: "i5-1345U, 16GB RAM, 256GB SSD",
          osVersion: "Windows 11 Pro",
          company: "NCPL",
          department: "Accounts",
          location: "Ahmedabad",
          vendorDetails: "HP India Sales",
          purchaseDate: new Date("2024-02-20"),
          invoiceNumber: "INV-HP-2024-002",
          cost: 72000,
          warrantyPeriod: "3 Years",
          warrantyExpiry: new Date("2027-02-20"),
          status: "ACTIVE",
          phone: "+91 9876543211",
          emailId: "accounts1@ncpl.com",
          softwareInstalled: "MS Office 365, Tally Prime, Chrome",
        },
      }),
      prisma.systemAsset.create({
        data: {
          assetTag: "NIPL-DES-001",
          productName: "Lenovo ThinkCentre M90q",
          serialNumber: "LNV-M90Q-2023-001",
          make: "Lenovo",
          config: "i5-13500T, 8GB RAM, 512GB SSD",
          osVersion: "Windows 10 Pro",
          company: "NIPL",
          department: "Sales",
          location: "Mumbai",
          vendorDetails: "Lenovo India Pvt Ltd",
          purchaseDate: new Date("2023-06-10"),
          invoiceNumber: "INV-LNV-2023-010",
          cost: 52000,
          warrantyPeriod: "3 Years",
          warrantyExpiry: new Date("2026-06-10"),
          status: "ACTIVE",
          softwareInstalled: "MS Office 2021, Chrome, Adobe Reader",
        },
      }),
      prisma.systemAsset.create({
        data: {
          assetTag: "NCPL-SRV-001",
          productName: "Dell PowerEdge R750",
          serialNumber: "DL-R750-2023-SRV",
          make: "Dell",
          config: "Xeon Gold 5318Y, 64GB RAM, 4x 1.2TB SAS",
          osVersion: "Windows Server 2022",
          company: "NCPL",
          department: "IT Department",
          location: "Ahmedabad",
          vendorDetails: "Dell EMC India",
          purchaseDate: new Date("2023-03-01"),
          invoiceNumber: "INV-DELL-SRV-2023-001",
          cost: 485000,
          warrantyPeriod: "5 Years",
          warrantyExpiry: new Date("2028-03-01"),
          status: "ACTIVE",
          remarks: "Primary domain server and file server",
        },
      }),
      prisma.systemAsset.create({
        data: {
          assetTag: "NRPL-LAP-001",
          productName: "Acer TravelMate P214",
          serialNumber: "ACER-TMP214-2022",
          make: "Acer",
          config: "i5-1235U, 8GB RAM, 256GB SSD",
          osVersion: "Windows 11 Home",
          company: "NRPL",
          department: "Marketing",
          location: "Rajkot",
          purchaseDate: new Date("2022-11-15"),
          cost: 48000,
          warrantyPeriod: "2 Years",
          warrantyExpiry: new Date("2024-11-15"),
          status: "REPAIR",
          remarks: "Battery replacement needed",
        },
      }),
      prisma.systemAsset.create({
        data: {
          assetTag: "NCPL-PRN-001",
          productName: "HP LaserJet Pro MFP M428fdw",
          serialNumber: "HP-M428-2023-PRN",
          make: "HP",
          config: "Laser, Duplex, WiFi, Fax, ADF",
          company: "NCPL",
          department: "Admin",
          location: "Ahmedabad",
          purchaseDate: new Date("2023-08-20"),
          invoiceNumber: "INV-HP-PRN-2023",
          cost: 35000,
          warrantyPeriod: "1 Year",
          warrantyExpiry: new Date("2024-08-20"),
          status: "ACTIVE",
        },
      }),
      prisma.systemAsset.create({
        data: {
          assetTag: "ISKY-LAP-001",
          productName: "MacBook Air M2",
          serialNumber: "APPLE-MBA-M2-001",
          make: "Apple",
          config: "M2 Chip, 8GB RAM, 256GB SSD",
          osVersion: "macOS Sonoma",
          company: "ISKY",
          department: "Design",
          location: "Bangalore",
          purchaseDate: new Date("2024-03-01"),
          invoiceNumber: "INV-APPLE-2024-001",
          cost: 112900,
          warrantyPeriod: "1 Year",
          warrantyExpiry: new Date("2025-03-01"),
          status: "ACTIVE",
          softwareInstalled: "Adobe Creative Suite, Figma, Slack",
        },
      }),
      prisma.systemAsset.create({
        data: {
          assetTag: "NCPL-LAP-003",
          productName: "Dell Inspiron 15 3520",
          serialNumber: "DL-INS-3520-OLD",
          make: "Dell",
          config: "i3-1215U, 8GB RAM, 256GB SSD",
          osVersion: "Windows 10 Pro",
          company: "NCPL",
          department: "HR",
          location: "Ahmedabad",
          purchaseDate: new Date("2021-05-10"),
          cost: 42000,
          warrantyPeriod: "2 Years",
          warrantyExpiry: new Date("2023-05-10"),
          status: "SCRAP",
          remarks: "Disposed - beyond economical repair",
        },
      }),
    ]);

    // Create asset transfers
    await prisma.assetTransfer.createMany({
      data: [
        {
          assetId: assets[0].id,
          fromUser: "Store Room",
          toUser: "IT Manager",
          fromLocation: "Ahmedabad Warehouse",
          toLocation: "Ahmedabad Office",
          notes: "New allocation",
          transferDate: new Date("2024-01-16"),
        },
        {
          assetId: assets[1].id,
          fromUser: "IT Department",
          toUser: "Accounts Team",
          fromLocation: "Ahmedabad IT",
          toLocation: "Ahmedabad Accounts",
          notes: "Department transfer",
          transferDate: new Date("2024-03-01"),
        },
      ],
    });

    // Create Software
    const softwareList = await Promise.all([
      prisma.software.create({
        data: {
          name: "Microsoft 365 Business Standard",
          vendor: "Microsoft",
          licenseType: "SUBSCRIPTION",
          licenseKey: "M365-NCPL-2024-***",
          totalLicenses: 50,
          usedLicenses: 38,
          costPerLicense: 770,
          renewalDate: new Date("2025-01-15"),
          expiryDate: new Date("2025-01-15"),
          purchaseDate: new Date("2024-01-15"),
          invoiceNumber: "INV-MS365-2024",
          notes: "Annual subscription for all NCPL staff",
        },
      }),
      prisma.software.create({
        data: {
          name: "Tally Prime Silver",
          vendor: "Tally Solutions",
          licenseType: "PERPETUAL",
          licenseKey: "TALLY-NCPL-PERP-***",
          totalLicenses: 5,
          usedLicenses: 4,
          costPerLicense: 22500,
          purchaseDate: new Date("2023-04-01"),
          invoiceNumber: "INV-TALLY-2023",
          notes: "Perpetual license with annual TSS renewal",
        },
      }),
      prisma.software.create({
        data: {
          name: "Adobe Creative Cloud",
          vendor: "Adobe",
          licenseType: "SUBSCRIPTION",
          totalLicenses: 5,
          usedLicenses: 3,
          costPerLicense: 2750,
          renewalDate: new Date("2025-03-15"),
          expiryDate: new Date("2025-03-15"),
          purchaseDate: new Date("2024-03-15"),
          notes: "For design and marketing teams",
        },
      }),
      prisma.software.create({
        data: {
          name: "Kaspersky Endpoint Security",
          vendor: "Kaspersky",
          licenseType: "SUBSCRIPTION",
          totalLicenses: 60,
          usedLicenses: 52,
          costPerLicense: 350,
          renewalDate: new Date("2024-12-31"),
          expiryDate: new Date("2024-12-31"),
          purchaseDate: new Date("2024-01-01"),
          notes: "Enterprise endpoint protection for all devices",
        },
      }),
      prisma.software.create({
        data: {
          name: "Zoho One",
          vendor: "Zoho Corporation",
          licenseType: "SUBSCRIPTION",
          totalLicenses: 30,
          usedLicenses: 25,
          costPerLicense: 1000,
          renewalDate: new Date("2025-06-01"),
          expiryDate: new Date("2025-06-01"),
          purchaseDate: new Date("2024-06-01"),
          notes: "CRM, Books, Projects, Creator bundle",
        },
      }),
      prisma.software.create({
        data: {
          name: "AutoCAD LT 2024",
          vendor: "Autodesk",
          licenseType: "SUBSCRIPTION",
          totalLicenses: 3,
          usedLicenses: 2,
          costPerLicense: 4500,
          renewalDate: new Date("2025-04-01"),
          expiryDate: new Date("2025-04-01"),
          purchaseDate: new Date("2024-04-01"),
          notes: "For engineering department",
        },
      }),
    ]);

    // Create Purchases
    const purchases = await Promise.all([
      prisma.purchase.create({
        data: {
          requestedBy: "Rajesh Kumar",
          department: "IT Department",
          company: "NCPL",
          productName: "Dell Latitude 5550 (5 units)",
          category: "HARDWARE",
          quantity: 5,
          estimatedCost: 425000,
          vendorName: "Dell Technologies India",
          vendorContact: "+91 1800-425-3355",
          purchaseMethod: "COMPANY_PURCHASE",
          justification: "Replacement for aging laptops in accounts team",
          priority: "High",
          status: "APPROVED",
          approvedBy: "Vikram Shah",
          approvalDate: new Date("2024-10-15"),
          quotationReceived: true,
          purchaseOrderSent: true,
          paymentDone: false,
          delivered: false,
          expectedDelivery: new Date("2024-11-30"),
        },
      }),
      prisma.purchase.create({
        data: {
          requestedBy: "Priya Mehta",
          department: "Admin",
          company: "NCPL",
          productName: "HP Color LaserJet Pro M454dn",
          category: "HARDWARE",
          quantity: 2,
          estimatedCost: 52000,
          vendorName: "HP Store India",
          purchaseMethod: "COMPANY_PURCHASE",
          justification: "Color printing needed for marketing materials",
          priority: "Normal",
          status: "PENDING",
          quotationReceived: false,
          purchaseOrderSent: false,
          paymentDone: false,
          delivered: false,
        },
      }),
      prisma.purchase.create({
        data: {
          requestedBy: "Amit Patel",
          department: "Sales",
          company: "NIPL",
          productName: "Microsoft Surface Pro 9",
          category: "HARDWARE",
          quantity: 1,
          estimatedCost: 115000,
          vendorName: "Microsoft Store",
          purchaseMethod: "COMPANY_PURCHASE",
          justification: "Client presentations and field demos",
          priority: "Normal",
          status: "REJECTED",
          remarks: "Budget exceeded for Q4. Resubmit in Q1.",
        },
      }),
      prisma.purchase.create({
        data: {
          requestedBy: "Neha Sharma",
          department: "IT Department",
          company: "NCPL",
          productName: "Ubiquiti UniFi AP U6 Pro (3 units)",
          category: "NETWORKING",
          quantity: 3,
          estimatedCost: 45000,
          vendorName: "IT Solutions Ahmedabad",
          vendorContact: "+91 79 2658 9900",
          purchaseMethod: "COMPANY_PURCHASE",
          justification: "WiFi coverage expansion for new floor",
          priority: "High",
          status: "COMPLETED",
          approvedBy: "Vikram Shah",
          approvalDate: new Date("2024-09-01"),
          actualCost: 42500,
          invoiceNumber: "INV-UNIFI-2024-009",
          quotationReceived: true,
          purchaseOrderSent: true,
          paymentDone: true,
          delivered: true,
        },
      }),
      prisma.purchase.create({
        data: {
          requestedBy: "Rajesh Kumar",
          department: "IT Department",
          company: "NCPL",
          productName: "APC Smart-UPS 3000VA",
          category: "HARDWARE",
          quantity: 1,
          estimatedCost: 35000,
          vendorName: "Schneider Electric",
          purchaseMethod: "COMPANY_PURCHASE",
          justification: "UPS replacement for server room",
          priority: "Urgent",
          status: "PAYMENT_DUE",
          approvedBy: "Vikram Shah",
          approvalDate: new Date("2024-10-20"),
          actualCost: 33500,
          invoiceNumber: "INV-APC-2024-015",
          quotationReceived: true,
          purchaseOrderSent: true,
          paymentDone: false,
          delivered: true,
        },
      }),
    ]);

    // Create Expenses
    const expenses = await Promise.all([
      prisma.expense.create({
        data: {
          description: "Annual Microsoft 365 Subscription Renewal",
          type: "SOFTWARE",
          vendor: "Microsoft India",
          amount: 462000,
          gst: 83160,
          totalAmount: 545160,
          date: new Date("2024-01-15"),
          invoiceNumber: "INV-MS365-REN-2024",
          company: "NCPL",
          department: "IT Department",
          paymentStatus: "PAID",
          paymentDate: new Date("2024-01-20"),
        },
      }),
      prisma.expense.create({
        data: {
          description: "Dell Laptops Purchase (3 units)",
          type: "HARDWARE",
          vendor: "Dell Technologies India",
          amount: 268500,
          gst: 48330,
          totalAmount: 316830,
          date: new Date("2024-02-10"),
          invoiceNumber: "INV-DELL-LAP-2024-02",
          company: "NCPL",
          department: "IT Department",
          paymentStatus: "PAID",
          paymentDate: new Date("2024-02-25"),
        },
      }),
      prisma.expense.create({
        data: {
          description: "Annual Kaspersky License Renewal",
          type: "SOFTWARE",
          vendor: "Kaspersky India",
          amount: 21000,
          gst: 3780,
          totalAmount: 24780,
          date: new Date("2024-01-05"),
          invoiceNumber: "INV-KAS-2024",
          company: "NCPL",
          department: "IT Department",
          paymentStatus: "PAID",
          paymentDate: new Date("2024-01-10"),
        },
      }),
      prisma.expense.create({
        data: {
          description: "Office WiFi Infrastructure Upgrade",
          type: "NETWORKING",
          vendor: "IT Solutions Ahmedabad",
          amount: 42500,
          gst: 7650,
          totalAmount: 50150,
          date: new Date("2024-09-15"),
          invoiceNumber: "INV-UNIFI-2024-009",
          company: "NCPL",
          department: "IT Department",
          paymentStatus: "PAID",
          paymentDate: new Date("2024-09-30"),
        },
      }),
      prisma.expense.create({
        data: {
          description: "Adobe Creative Cloud Annual (5 licenses)",
          type: "SOFTWARE",
          vendor: "Adobe Systems India",
          amount: 165000,
          gst: 29700,
          totalAmount: 194700,
          date: new Date("2024-03-15"),
          invoiceNumber: "INV-ADOBE-2024",
          company: "NCPL",
          department: "Marketing",
          paymentStatus: "PAID",
          paymentDate: new Date("2024-03-20"),
        },
      }),
      prisma.expense.create({
        data: {
          description: "Server Room AC Maintenance",
          type: "MAINTENANCE",
          vendor: "CoolTech Services",
          amount: 15000,
          gst: 2700,
          totalAmount: 17700,
          date: new Date("2024-10-01"),
          company: "NCPL",
          department: "Admin",
          paymentStatus: "PAID",
          paymentDate: new Date("2024-10-05"),
        },
      }),
      prisma.expense.create({
        data: {
          description: "Tally Prime Annual TSS Renewal",
          type: "SOFTWARE",
          vendor: "Tally Solutions",
          amount: 11250,
          gst: 2025,
          totalAmount: 13275,
          date: new Date("2024-04-01"),
          invoiceNumber: "INV-TALLY-TSS-2024",
          company: "NCPL",
          department: "Accounts",
          paymentStatus: "PAID",
          paymentDate: new Date("2024-04-05"),
        },
      }),
      prisma.expense.create({
        data: {
          description: "Internet Lease Line - October 2024",
          type: "INTERNET_TELECOM",
          vendor: "Jio Business",
          amount: 25000,
          gst: 4500,
          totalAmount: 29500,
          date: new Date("2024-10-01"),
          company: "NCPL",
          department: "IT Department",
          paymentStatus: "UNPAID",
          remarks: "Monthly recurring expense",
        },
      }),
      prisma.expense.create({
        data: {
          description: "Cloud Hosting - AWS (Oct 2024)",
          type: "CLOUD_SERVICES",
          vendor: "Amazon Web Services",
          amount: 18500,
          gst: 3330,
          totalAmount: 21830,
          date: new Date("2024-10-15"),
          company: "NCPL",
          department: "IT Department",
          paymentStatus: "UNPAID",
        },
      }),
      prisma.expense.create({
        data: {
          description: "CCTV System Installation - Mumbai Office",
          type: "HARDWARE",
          vendor: "SecureVision Systems",
          amount: 85000,
          gst: 15300,
          totalAmount: 100300,
          date: new Date("2024-08-20"),
          invoiceNumber: "INV-CCTV-MUM-2024",
          company: "NIPL",
          department: "Admin",
          paymentStatus: "PARTIAL",
          remarks: "50% advance paid, balance on completion",
        },
      }),
      prisma.expense.create({
        data: {
          description: "Printer Cartridges & Supplies Q4",
          type: "CONSUMABLES",
          vendor: "Office Supply Co",
          amount: 12000,
          gst: 2160,
          totalAmount: 14160,
          date: new Date("2024-10-05"),
          company: "NCPL",
          department: "Admin",
          paymentStatus: "PAID",
          paymentDate: new Date("2024-10-10"),
        },
      }),
      prisma.expense.create({
        data: {
          description: "Zoho One Annual Subscription",
          type: "SOFTWARE",
          vendor: "Zoho Corporation",
          amount: 360000,
          gst: 64800,
          totalAmount: 424800,
          date: new Date("2024-06-01"),
          invoiceNumber: "INV-ZOHO-2024",
          company: "NCPL",
          department: "IT Department",
          paymentStatus: "PAID",
          paymentDate: new Date("2024-06-05"),
        },
      }),
    ]);

    // Create Audit Logs
    await prisma.auditLog.createMany({
      data: [
        {
          action: "User Login",
          entity: "Admin User",
          details: "Admin logged in from 192.168.1.100",
          userId: admin.id,
          createdAt: new Date("2024-10-20T09:00:00Z"),
        },
        {
          action: "Asset Created",
          entity: "Dell Latitude 5540",
          entityId: assets[0].id,
          details: "Asset NCPL-LAP-001 created",
          userId: admin.id,
          createdAt: new Date("2024-10-20T09:15:00Z"),
        },
        {
          action: "Software Added",
          entity: "Microsoft 365 Business Standard",
          entityId: softwareList[0].id,
          details: "Added with 50 licenses",
          userId: admin.id,
          createdAt: new Date("2024-10-20T09:30:00Z"),
        },
        {
          action: "Purchase Request Created",
          entity: "Dell Latitude 5550 (5 units)",
          entityId: purchases[0].id,
          details: "Purchase request submitted by Rajesh Kumar",
          userId: manager.id,
          createdAt: new Date("2024-10-20T10:00:00Z"),
        },
        {
          action: "Expense Created",
          entity: "Internet Lease Line - October 2024",
          entityId: expenses[7].id,
          details: "Monthly recurring expense ₹29,500",
          userId: admin.id,
          createdAt: new Date("2024-10-20T10:30:00Z"),
        },
        {
          action: "Asset Transferred",
          entity: "HP EliteBook 840 G10",
          entityId: assets[1].id,
          details: "Transferred from IT to Accounts department",
          userId: admin.id,
          createdAt: new Date("2024-10-19T14:00:00Z"),
        },
        {
          action: "Purchase Approved",
          entity: "Ubiquiti UniFi AP U6 Pro",
          entityId: purchases[3].id,
          details: "Approved by Vikram Shah",
          userId: manager.id,
          createdAt: new Date("2024-10-18T11:00:00Z"),
        },
        {
          action: "Settings Updated",
          entity: "System Settings",
          details: "Notification preferences updated",
          userId: admin.id,
          createdAt: new Date("2024-10-17T16:00:00Z"),
        },
      ],
    });

    // Create Notifications
    await prisma.notification.createMany({
      data: [
        {
          title: "Kaspersky License Expiring",
          message: "Kaspersky Endpoint Security licenses expire on Dec 31, 2024. Renewal needed for 60 licenses.",
          type: "WARNING",
          userId: admin.id,
        },
        {
          title: "New Purchase Request",
          message: "Priya Mehta has submitted a purchase request for HP Color LaserJet Pro M454dn (2 units).",
          type: "INFO",
          userId: admin.id,
        },
        {
          title: "Payment Due: APC Smart-UPS",
          message: "Payment of ₹33,500 is due for APC Smart-UPS 3000VA. Invoice: INV-APC-2024-015",
          type: "ALERT",
          userId: admin.id,
        },
        {
          title: "Asset Warranty Expiring",
          message: "Acer TravelMate P214 (NRPL-LAP-001) warranty expired on Nov 15, 2024.",
          type: "WARNING",
          userId: manager.id,
        },
        {
          title: "Monthly IT Report Ready",
          message: "The October 2024 IT expense report is ready for review.",
          type: "INFO",
          userId: admin.id,
        },
      ],
    });

    // Create Budgets
    await prisma.budget.createMany({
      data: [
        { name: "IT Hardware Q4 2024", company: "NCPL", department: "IT Department", category: "Hardware", period: "QUARTERLY", month: 10, year: 2024, amount: 500000, spent: 316830, alertAt: 80 },
        { name: "Software Licenses 2024", company: "NCPL", department: "IT Department", category: "Software", period: "YEARLY", year: 2024, amount: 1200000, spent: 1002015, alertAt: 85 },
        { name: "Cloud & Hosting 2024", company: "NCPL", department: "IT Department", category: "Cloud", period: "YEARLY", year: 2024, amount: 300000, spent: 218300, alertAt: 80 },
        { name: "IT Infrastructure Oct 2024", company: "NCPL", department: "IT Department", category: "Infrastructure", period: "MONTHLY", month: 10, year: 2024, amount: 150000, spent: 50150, alertAt: 75 },
        { name: "Marketing Tech 2024", company: "NCPL", department: "Marketing", category: "Software", period: "YEARLY", year: 2024, amount: 250000, spent: 194700, alertAt: 80 },
      ],
    });

    // Create Vendors
    await prisma.vendor.createMany({
      data: [
        { name: "Dell Technologies India", contactPerson: "Suresh Patel", email: "enterprise@dell.co.in", phone: "+91 1800-425-3355", address: "DLF Cyber City, Phase 2", city: "Gurugram", state: "Haryana", gstNumber: "06AABCD1234E1Z5", category: "Hardware", website: "https://www.dell.co.in", active: true },
        { name: "Microsoft India Pvt Ltd", contactPerson: "Rajiv Sharma", email: "licensing@microsoft.co.in", phone: "+91 1800-102-1100", address: "DLF Building No. 10A", city: "Gurugram", state: "Haryana", gstNumber: "06AABCM5678F1Z2", category: "Software", website: "https://www.microsoft.com/en-in", active: true },
        { name: "HP India Sales Pvt Ltd", contactPerson: "Anita Desai", email: "sales@hp.co.in", phone: "+91 1800-108-4747", address: "DLF IT Park", city: "Chennai", state: "Tamil Nadu", gstNumber: "33AABCH9012G1Z8", category: "Hardware", website: "https://www.hp.com/in-en", active: true },
        { name: "IT Solutions Ahmedabad", contactPerson: "Kiran Joshi", email: "info@itsolutions-ahd.com", phone: "+91 79 2658 9900", address: "Satellite Road, Jodhpur Cross Roads", city: "Ahmedabad", state: "Gujarat", gstNumber: "24AABCI3456H1Z4", category: "Networking", active: true },
        { name: "Tally Solutions Pvt Ltd", contactPerson: "Support Team", email: "support@tallysolutions.com", phone: "+91 80-4674-6600", city: "Bangalore", state: "Karnataka", gstNumber: "29AABCT7890J1Z1", category: "Software", website: "https://tallysolutions.com", active: true },
        { name: "Zoho Corporation Pvt Ltd", contactPerson: "Account Manager", email: "sales@zoho.com", phone: "+91 44-4687-9130", city: "Chennai", state: "Tamil Nadu", gstNumber: "33AABCZ1234K1Z7", category: "Software", website: "https://www.zoho.com", active: true },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      counts: {
        users: 3,
        assets: assets.length,
        software: softwareList.length,
        purchases: purchases.length,
        expenses: expenses.length,
        budgets: 5,
        vendors: 6,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Seed failed", details: message }, { status: 500 });
  }
}
