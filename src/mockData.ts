import { Product, InventoryTransaction, Contract, Employee, Customer } from './types';

export const mockProducts: Product[] = [
    { id: 'SP001', name: 'Mainboard ASUS Z790', unit: 'cái', importPrice: 8500000, importQuantity: 50, soldQuantity: 15, category: 'Linh kiện máy tính', imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=200&h=200', importDate: '2026-04-01', expiryDate: '', warranty: '36 tháng', remainingStockNote: '', note: '' },
    { id: 'SP002', name: 'PC Gaming Linh Hân V1', unit: 'bộ', importPrice: 15000000, importQuantity: 20, soldQuantity: 8, category: 'Máy vi tính', imageUrl: 'https://images.unsplash.com/photo-1541625602330-21570e30756f?auto=format&fit=crop&q=80&w=200&h=200', importDate: '2026-04-10', expiryDate: '', warranty: '24 tháng', remainingStockNote: '', note: '' },
    { id: 'SP003', name: 'Máy in Canon LBP2900', unit: 'cái', importPrice: 3200000, importQuantity: 30, soldQuantity: 25, category: 'Thiết bị văn phòng', imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=200&h=200', importDate: '2026-04-15', expiryDate: '', warranty: '12 tháng', remainingStockNote: '', note: '' },
];

export const mockTransactions: InventoryTransaction[] = [
    { id: 'PN001', date: '2026-04-15', type: 'IN', productId: 'SP001', productName: 'Thép tấm 5mm', quantity: 2000, price: 15000, total: 30000000, partner: 'Thép Hòa Phát', operator: 'Nguyễn Văn A', note: 'Nhập hàng tháng 4' },
    { id: 'PX001', date: '2026-04-20', type: 'OUT', productId: 'SP001', productName: 'Thép tấm 5mm', quantity: 500, price: 22000, total: 11000000, partner: 'Cơ khí Minh Đức', operator: 'Trần Thị B', note: 'Xuất xưởng mã HĐ-01' },
];

export const mockContracts: Contract[] = [
    { 
        id: 'HĐ-2026-001', 
        name: 'Cung cấp và lắp đặt hệ thống máy tính văn phòng - Giai đoạn 1', 
        customer: 'Ngân hàng Techcombank', 
        representative: 'Ông Nguyễn Văn A',
        sideB: 'Công ty TNHH Đầu tư Sản xuất Linh Hân',
        type: 'CUNG_CAP',
        value: 1500000000, 
        signDate: '2026-01-10', 
        startDate: '2026-01-15',
        endDate: '2026-06-30',
        note: 'Dự án trọng điểm quý 1',
        performanceGuaranteeAmount: 150000000,
        performanceGuaranteeIssueDate: '2026-01-12',
        performanceGuaranteeExpiryDate: '2026-12-31',
        performanceGuaranteeStatus: 'PENDING',
        bidGuaranteeAmount: 50000000,
        bidGuaranteeStatus: 'DONE',
        bidGuaranteeRefundDate: '2026-01-20',
        paidAmount: 500000000,
        isOverdueDebt: false,
        overdueAmount: 0,
        acceptanceStatus: 'NO',
        liquidationStatus: 'NO',
        overallStatus: 'ACTIVE',
        hasWarranty: 'YES',
        warrantyMonths: 24,
        warrantyStartDate: '2026-07-01',
        attachments: []
    },
    { 
        id: 'HĐ-2026-002', 
        name: 'Bảo trì hệ thống máy chủ và hạ tầng mạng', 
        customer: 'Tập đoàn Vingroup', 
        representative: 'Bà Trần Thị B',
        sideB: 'Công ty TNHH Đầu tư Sản xuất Linh Hân',
        type: 'DICH_VU',
        value: 500000000, 
        signDate: '2026-02-05', 
        startDate: '2026-02-10',
        endDate: '2027-02-10',
        note: 'Hợp đồng dịch vụ năm',
        performanceGuaranteeAmount: 0,
        performanceGuaranteeIssueDate: '',
        performanceGuaranteeExpiryDate: '',
        performanceGuaranteeStatus: 'DONE',
        bidGuaranteeAmount: 0,
        bidGuaranteeStatus: 'DONE',
        paidAmount: 200000000,
        isOverdueDebt: true,
        overdueAmount: 100000000,
        overdueDate: '2026-04-01',
        acceptanceStatus: 'YES',
        acceptanceDate: '2026-03-01',
        liquidationStatus: 'NO',
        overallStatus: 'ACTIVE',
        hasWarranty: 'NO',
        warrantyMonths: 0,
        warrantyStartDate: '',
        attachments: []
    }
];

export const mockEmployees: Employee[] = [
    { 
        id: 'LH-NV-001', 
        name: 'Nguyễn Quang Huy', 
        dob: '1990-05-12', 
        gender: 'Nam', 
        idCard: '0123456789', 
        phone: '0912345678', 
        email: 'huy.nq@linhhan.vn', 
        address: 'Quận 12, TP.HCM', 
        department: 'Ban giám đốc', 
        position: 'Giám đốc', 
        startDate: '2020-01-01', 
        contractType: 'Chính thức',
        contractSignDate: '2020-01-01',
        contractExpiryDate: '2030-01-01',
        baseSalary: 35000000, 
        status: 'Đang làm', 
        note: 'Người sáng lập',
        attendance: [
            {
                monthYear: '04/2026',
                standardDays: 22,
                actualDays: 22,
                leaveWithReason: 0,
                leaveWithoutReason: 0,
                annualLeaveUsed: 0,
                lateTimes: 0,
                lateMinutes: 0,
                overtimeRegular: 10,
                overtimeHoliday: 0,
                overtimeWeekend: 4,
                monthlyNote: 'Làm việc tích cực'
            }
        ],
        projects: [
            {
                id: 'P001',
                name: 'Dự án Cung cấp Hệ thống Server NH Techcombank',
                bidId: 'BID-2026-TCB',
                client: 'Ngân hàng Techcombank',
                value: 5000000000,
                role: 'CHỦ TRÌ',
                winDate: '2026-01-05',
                status: 'ACTIVE'
            }
        ],
        attachments: []
    },
    { 
        id: 'LH-NV-002', 
        name: 'Trần Thị Mai', 
        dob: '1995-10-25', 
        gender: 'Nữ', 
        idCard: '0987654321', 
        department: 'Kế toán', 
        position: 'Trưởng phòng', 
        startDate: '2022-03-15', 
        phone: '0922334455', 
        email: 'mai.tt@linhhan.vn', 
        address: 'Gò Vấp, TP.HCM', 
        baseSalary: 18000000, 
        contractType: 'Chính thức',
        contractSignDate: '2022-03-15',
        contractExpiryDate: '2025-03-15',
        status: 'Đang làm',
        note: '',
        attendance: [],
        projects: [],
        attachments: []
    },
];

export const mockCustomers: Customer[] = [
    { id: 'KH001', name: 'Tập đoàn Hòa Phát', contactPerson: 'Ông Trần Đình Long', position: 'Chủ tịch', phone: '024.123.456', email: 'contact@hoaphat.com.vn', address: 'Hà Nội', taxCode: '0101234567', bankAccount: '190012345678', type: 'LOYAL', source: 'Giới thiệu', createdAt: '2024-01-01', managedBy: 'Đặng Thị Diễm Tuyết' },
    { id: 'KH002', name: 'Công ty Cơ khí ABC', contactPerson: 'Bà Lê Thị Hồng', position: 'Trưởng phòng thu mua', phone: '0908123456', email: 'hong.le@abc-mech.com', address: 'Bình Dương', taxCode: '3700123456', bankAccount: '007100123456', type: 'ACTIVE', source: 'Quảng cáo', createdAt: '2025-05-20', managedBy: 'Vanh phòng' },
];
