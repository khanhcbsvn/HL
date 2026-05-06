export interface Product {
    id: string;
    name: string;
    imageUrl?: string;
    category: string;
    remainingStockNote: string;
    unit: string;
    importPrice: number;
    importQuantity: number;
    importDate: string;
    expiryDate: string;
    warranty: string;
    soldQuantity: number;
    note: string;
}

export interface InventoryTransaction {
    id: string;
    date: string;
    type: 'IN' | 'OUT';
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
    partner: string; // Supplier for IN, Customer for OUT
    operator: string;
    note: string;
}

export interface FileAttachment {
    id: string;
    name: string;
    type: string;
    size: number;
    base64: string;
    uploadDate: string;
}

export interface Contract {
    // Basic Info
    id: string; // Số hợp đồng (duy nhất)
    name: string; // Tên hợp đồng / dự án
    customer: string; // Chủ đầu tư
    representative: string; // Người đại diện
    sideB: string; // Bên thực hiện
    type: 'THI_CONG' | 'TU_VAN' | 'CUNG_CAP' | 'DICH_VU' | 'KHAC';
    value: number; // Giá trị VNĐ
    signDate: string;
    startDate: string;
    endDate: string; // Dự kiến
    note: string;

    // Finance & Guarantee
    performanceGuaranteeAmount: number;
    performanceGuaranteeIssueDate: string;
    performanceGuaranteeExpiryDate: string;
    performanceGuaranteeStatus: 'PENDING' | 'DONE'; // Chưa tất toán / Đã tất toán
    
    bidGuaranteeAmount: number;
    bidGuaranteeStatus: 'PENDING' | 'DONE'; // Chưa thu hồi / Đã thu hồi
    bidGuaranteeRefundDate?: string;

    paidAmount: number;
    isOverdueDebt: boolean;
    overdueAmount: number;
    overdueDate?: string;

    // Status
    acceptanceStatus: 'YES' | 'NO';
    acceptanceDate?: string;
    liquidationStatus: 'YES' | 'NO';
    liquidationDate?: string;
    overallStatus: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'LIQUIDATED' | 'CANCELLED';

    // Warranty
    hasWarranty: 'YES' | 'NO';
    warrantyMonths: number;
    warrantyStartDate: string;
    // Expiry date is calculated: warrantyStartDate + warrantyMonths

    // Attachments
    attachments: FileAttachment[];
}

export interface AttendanceRecord {
    monthYear: string; // MM/YYYY
    standardDays: number;
    actualDays: number;
    leaveWithReason: number;
    leaveWithoutReason: number;
    annualLeaveUsed: number;
    lateTimes: number;
    lateMinutes: number;
    overtimeRegular: number;
    overtimeHoliday: number;
    overtimeWeekend: number;
    monthlyNote: string;
}

export interface ProjectExperience {
    id: string;
    name: string;
    bidId: string;
    client: string;
    value: number;
    role: 'CHỦ TRÌ' | 'THAM GIA' | 'HỖ TRỢ';
    winDate: string;
    status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
}

export interface Employee {
    id: string;
    name: string;
    avatar?: string;
    gender: 'Nam' | 'Nữ' | 'Khác';
    dob: string;
    idCard: string;
    phone: string;
    email: string;
    address: string;
    department: 'Kỹ thuật' | 'Kinh doanh' | 'Kế toán' | 'Hành chính' | 'Ban giám đốc' | 'Khác';
    position: 'Nhân viên' | 'Trưởng nhóm' | 'Trưởng phòng' | 'Phó giám đốc' | 'Giám đốc' | 'Khác';
    startDate: string;
    contractType: 'Thử việc' | 'Chính thức' | 'Thời vụ' | 'Cộng tác viên';
    contractSignDate: string;
    contractExpiryDate: string;
    baseSalary: number;
    status: 'Đang làm' | 'Nghỉ phép' | 'Nghỉ việc' | 'Thử việc';
    note: string;
    
    attendance: AttendanceRecord[];
    projects: ProjectExperience[];
    attachments: FileAttachment[];
}

export interface Customer {
    id: string;
    name: string;
    contactPerson: string;
    position: string;
    phone: string;
    email: string;
    address: string;
    taxCode: string;
    bankAccount: string;
    type: 'POTENTIAL' | 'ACTIVE' | 'LOYAL' | 'INACTIVE';
    source: string;
    createdAt: string;
    managedBy: string;
}

export interface SalesOpportunity {
    id: string;
    customerId: string;
    stage: 'PROSPECT' | 'ADVISE' | 'QUOTE' | 'NEGOTIATE' | 'CLOSED' | 'COMPLETED';
    probability: number;
    expectedValue: number;
    lastUpdate: string;
}

export interface Interaction {
    id: string;
    customerId: string;
    date: string;
    type: string;
    content: string;
    result: string;
    nextAppointment?: string;
}

export interface QuotationItem {
    id: string;
    code: string;
    description: string;
    details?: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    note: string;
}

export interface QuotationHistory {
    timestamp: string;
    content: string;
    user: string;
}

export interface Quotation {
    id: string;
    name: string;
    type: 'Thi công' | 'Cung cấp thiết bị' | 'Tư vấn' | 'Dịch vụ' | 'Khác';
    tenderPackage?: string;
    preparedBy: string;
    preparerPhone?: string;
    preparerEmail?: string;
    department: string;
    date: string;
    validityDays: number;
    expiryDate: string;
    internalNote: string;
    
    // Customer Info
    customerName: string;
    contactPerson: string;
    position: string;
    phone: string;
    email: string;
    location: string;
    billingAddress: string;
    taxCode: string;
    
    // Items
    items: QuotationItem[];
    taxRate: number;
    taxAmount: number;
    discountRate: number;
    discountAmount: number;
    subTotal: number;
    grandTotal: number;
    
    // Status
    status: 'MỚI_TẠO' | 'ĐÃ_GỬI' | 'ĐANG_ĐÀM_PHÁN' | 'THÀNH_CÔNG' | 'THẤT_BẠI' | 'HẾT_HIỆU_LỰC';
    sentDate?: string;
    successDate?: string;
    deliveryTime?: string;
    contractNumber?: string;
    failureReason?: 'Giá cao' | 'Năng lực' | 'Khách chọn đơn vị khác' | 'Dự án hủy' | 'Khác';
    resultNote?: string;
    updatedAt: string;
    
    // Attachments & History
    attachments: FileAttachment[];
    history: QuotationHistory[];
}

export type ImportContractStatus = 'MỚI_TẠO' | 'ĐANG_THỰC_HIỆN' | 'HÀNG_ĐÃ_VỀ' | 'HOÀN_THÀNH' | 'TẠM_DỪNG' | 'HỦY';
export type ImportPaymentStatus = 'CHƯA_THANH_TOÁN' | 'THANH_TOÁN_MỘT_PHẦN' | 'ĐÃ_THANH_TOÁN_ĐỦ';
export type Incoterms = 'FOB' | 'CIF' | 'CFR' | 'EXW' | 'DDP' | 'Khác';
export type ImportPaymentMethod = 'L/C' | 'T/T' | 'D/P' | 'D/A' | 'Khác';
export type ImportCurrency = 'USD' | 'EUR' | 'CNY' | 'JPY' | 'Khác';

export interface ImportContractItem {
    id: string;
    description: string;
    sku: string;
    quantity: number;
    unit: string;
    specs: string;
    unitPriceForeign: number;
    unitPriceVND: number;
    vatRate: 0 | 5 | 8 | 10;
    totalForeign: number; // = qty * price + vat (logic handles this)
    totalVND: number;
    origin: string;
}

export interface ImportContract {
    // Basic Info
    id: string; // Số hợp đồng (tự động sinh HĐ-NK-YYYY-XXXX)
    name: string; // Tên hợp đồng / tên dự án nhập khẩu
    signDate: string;
    expectedImportDate: string;
    actualImportDate?: string;
    seller: string;
    originCountry: string;
    sellerRepresentative: string;
    sellerContact: string; // Email / SĐT
    
    currency: ImportCurrency;
    exchangeRate: number;
    incoterms: Incoterms;
    paymentMethod: ImportPaymentMethod;
    billOfLading: string;
    departurePort: string;
    arrivalPort: string;
    status: ImportContractStatus;
    internalNote: string;

    // Warranty
    hasWarranty: boolean;
    warrantyMonths: number;
    warrantyStartDate: string;
    warrantyEndDate: string; // calculated
    warrantyTerms: string;

    // Finance
    totalAmountForeign: number; // Sum rows
    totalAmountVND: number; // Sum rows
    paidAmountForeign: number;
    paidAmountVND: number;
    paymentDate?: string;
    paymentStatus: ImportPaymentStatus;
    
    isOverdue: boolean;
    overdueAmountVND: number;
    overdueDate?: string;

    // Goods
    items: ImportContractItem[];

    // Additional Costs
    intlShippingFeeForeign: number;
    intlShippingFeeVND: number;
    domesticShippingFeeVND: number;
    otherFeesVND: number; // lưu kho / bốc xếp / kiểm định / hải quan

    // Summary (Calculated)
    totalGoodsForeign: number;
    totalGoodsVND: number;
    totalVATForeign: number;
    totalVATVND: number;
    totalBeforeShippingVND: number;
    finalTotalVND: number;
    avgPriceVND: number;

    // Attachments
    attachments: FileAttachment[];
}

export type PasswordRequestStatus = 'CHỜ_DUYỆT' | 'ĐÃ_DUYỆT' | 'TỪ_CHỐI';

export interface PasswordResetRequest {
    id: string;
    username: string;
    newPasswordHash: string;
    requestedAt: string;
    status: PasswordRequestStatus;
    approvedAt?: string;
}
