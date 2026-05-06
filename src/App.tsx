/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart3, 
  Box, 
  FileText, 
  Users, 
  LayoutDashboard, 
  AlertTriangle, 
  UsersRound, 
  Search, 
  Terminal,
  Send,
  Phone,
  Settings,
  ChevronRight,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Menu as MenuIcon,
  Lock,
  User as UserIcon,
  LogOut,
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Layers,
  MapPin,
  Tag,
  Truck,
  FileEdit,
  ChevronDown,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  History,
  ShieldCheck,
  Download,
  Eye,
  EyeOff,
  Clock3,
  CheckCircle,
  AlertCircle,
  Info,
  Printer,
  UserPlus,
  Briefcase,
  HardDrive,
  Camera,
  MoreVertical,
  Grid,
  List as ListIcon,
  Mail,
  User,
  Upload,
  Globe,
  CreditCard,
  Coins,
  Ship,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  mockProducts, 
  mockTransactions, 
  mockContracts, 
  mockEmployees, 
  mockCustomers
} from './mockData';
import { 
  Product, 
  InventoryTransaction, 
  Contract, 
  FileAttachment,
  Employee, 
  Customer,
  AttendanceRecord,
  ProjectExperience,
  Quotation,
  ImportContract,
  ImportContractItem,
  ImportContractStatus,
  ImportPaymentStatus,
  Incoterms,
  ImportPaymentMethod,
  ImportCurrency,
  PasswordResetRequest,
  PasswordRequestStatus
} from './types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { format, differenceInDays, addMonths, parseISO } from 'date-fns';
import html2pdf from 'html2pdf.js';
import logoHl from './assets/images/regenerated_image_1777979393012.png';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const STORAGE_KEY = 'LINH_HAN_PRODUCTS_V3';
const CONTRACT_STORAGE_KEY = 'LINH_HAN_CONTRACTS_V1';
const IMPORT_CONTRACT_STORAGE_KEY = 'LINH_HAN_IMPORT_CONTRACTS_V1';
const PW_REQUEST_STORAGE_KEY = 'LINH_HAN_PW_REQUESTS_V1';
const NK_PASSWORD_KEY = 'nk_password';
const NK_SESSION_KEY = 'nk_session';
const NK_PW_REQUEST_KEY = 'nk_pw_requests';

// Helper for Vietnamese numbers to words
const numberToTextVietnamese = (total: number): string => {
  if (total === 0) return "Không đồng";
  
  const chuSo = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
  const hang = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ"];

  const docSo3ChuSo = (n: number) => {
    let res = "";
    const tram = Math.floor(n / 100);
    const chuc = Math.floor((n % 100) / 10);
    const donVi = n % 10;

    if (tram === 0 && chuc === 0 && donVi === 0) return "";

    if (tram !== 0) {
      res += chuSo[tram] + " trăm ";
      if (chuc === 0 && donVi !== 0) res += "lẻ ";
    }

    if (chuc !== 0 && chuc !== 1) {
      res += chuSo[chuc] + " mươi ";
      if (chuc !== 0 && donVi === 0) res = res.trim();
    } else if (chuc === 1) {
      res += "mười ";
    }

    if (donVi !== 0) {
      if (donVi === 1 && chuc > 1) res += "mốt";
      else if (donVi === 5 && chuc >= 1) res += "lăm";
      else if (donVi === 4 && chuc >= 1) res += "bốn"; // or "tư" depending on dialect
      else res += chuSo[donVi];
    }

    return res.trim();
  };

  let str = "";
  let i = 0;
  let remaining = Math.round(total);

  while (remaining > 0) {
    const group = remaining % 1000;
    const groupStr = docSo3ChuSo(group);
    if (groupStr !== "") {
      str = groupStr + hang[i] + (str !== "" ? ", " : "") + str;
    }
    remaining = Math.floor(remaining / 1000);
    i++;
  }

  const result = str.trim().replace(/,$/, "") + " đồng";
  return result.charAt(0).toUpperCase() + result.slice(1);
};


export default function App() {
  const [currentView, setCurrentView] = useState<'WELCOME' | 'MENU' | 'KHO' | 'HOPDONG' | 'NHANSU' | 'DOANHTHU' | 'CRM' | 'DASHBOARD' | 'ALERT' | 'QUOTATION' | 'IMPORT_CONTRACT' | 'PW_APPROVAL' | 'FORGOT_PW' | 'NK_ADMIN' | 'FORGOT_PW_NK'>('WELCOME');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [contracts, setContracts] = useState<Contract[]>(() => {
    const saved = localStorage.getItem(CONTRACT_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return mockContracts;
      }
    }
    return mockContracts;
  });

  const [importContracts, setImportContracts] = useState<ImportContract[]>(() => {
    const saved = localStorage.getItem(IMPORT_CONTRACT_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(IMPORT_CONTRACT_STORAGE_KEY, JSON.stringify(importContracts));
  }, [importContracts]);

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem('LINH_HAN_QUOTATIONS_V1');
    return saved ? JSON.parse(saved) : [];
  });

  const [passwordRequests, setPasswordRequests] = useState<PasswordResetRequest[]>(() => {
    const saved = localStorage.getItem(PW_REQUEST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(PW_REQUEST_STORAGE_KEY, JSON.stringify(passwordRequests));
  }, [passwordRequests]);

  const [nkRequests, setNkRequests] = useState<PasswordResetRequest[]>(() => {
    const saved = localStorage.getItem(NK_PW_REQUEST_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [isNkLoggedIn, setIsNkLoggedIn] = useState(() => {
    const session = localStorage.getItem(NK_SESSION_KEY);
    if (!session) return false;
    try {
      const data = JSON.parse(session);
      if (data.loggedIn && data.expiry > Date.now()) {
        return true;
      }
      localStorage.removeItem(NK_SESSION_KEY);
      return false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(NK_PW_REQUEST_KEY, JSON.stringify(nkRequests));
  }, [nkRequests]);

  // Ensure default password exists
  useEffect(() => {
    if (!localStorage.getItem(NK_PASSWORD_KEY)) {
      localStorage.setItem(NK_PASSWORD_KEY, btoa('Admin@123'));
    }
  }, []);

  const loginNK = () => {
    const expiry = Date.now() + 8 * 60 * 60 * 1000;
    localStorage.setItem(NK_SESSION_KEY, JSON.stringify({ loggedIn: true, expiry }));
    setIsNkLoggedIn(true);
  };

  const logoutNK = () => {
    localStorage.removeItem(NK_SESSION_KEY);
    setIsNkLoggedIn(false);
  };

  const approveNKRequest = (request: any) => {
    if (confirm(`Phê duyệt đổi mật khẩu cho tài khoản ${request.username}?`)) {
      if (request.username === 'admin') {
        localStorage.setItem(NK_PASSWORD_KEY, request.newPassword);
      }
      setNkRequests(prev => prev.map(r => 
        r.id === request.id ? { ...r, status: 'approved', approvedAt: new Date().toISOString() } : r
      ));
      alert('Đã phê duyệt! Mật khẩu mới đã được kích hoạt.');
    }
  };

  const rejectNKRequest = (requestId: string) => {
    if (confirm('Từ chối yêu cầu đổi mật khẩu này?')) {
      setNkRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'rejected' } : r
      ));
    }
  };

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('linhhan_employees');
    return saved ? JSON.parse(saved) : mockEmployees;
  });
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    localStorage.setItem('linhhan_employees', JSON.stringify(employees));
  }, [employees]);

  const handleEmployeeSubmit = (emp: Employee) => {
    if (editingEmployee) {
      setEmployees(employees.map(e => e.id === emp.id ? emp : e));
    } else {
      setEmployees([...employees, emp]);
    }
    setIsEmployeeModalOpen(false);
    setEditingEmployee(null);
  };

  const deleteEmployee = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này? Dữ liệu sẽ không thể khôi phục.')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);

  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [viewingQuotation, setViewingQuotation] = useState<Quotation | null>(null);

  const [isImportContractModalOpen, setIsImportContractModalOpen] = useState(false);
  const [editingImportContract, setEditingImportContract] = useState<ImportContract | null>(null);
  const [viewingImportContract, setViewingImportContract] = useState<ImportContract | null>(null);

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetEmail !== 'hoikhanhdo.rfrvn@gmail.com') {
      alert('Email không tồn tại trong hệ thống!');
      return;
    }
    alert(`Một liên kết đặt lại mật khẩu đã được mô phỏng gửi tới: ${resetEmail}. Trong thực tế, hệ thống sẽ gửi một token xác thực.`);
    // Cho phép đặt lại mật khẩu ngay tại đây để demo
    const pass = prompt('Nhập mật khẩu mới cho tài khoản:');
    if (pass) {
        localStorage.setItem('LINH_HAN_PASSWORD', pass);
        alert('Đặt lại mật khẩu thành công!');
        setIsForgotPassword(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Thành xác nhận mật khẩu không khớp!');
      return;
    }
    localStorage.setItem('LINH_HAN_PASSWORD', newPassword);
    alert('Đổi mật khẩu thành công!');
    setIsChangePasswordModalOpen(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  useEffect(() => {
    localStorage.setItem('LINH_HAN_QUOTATIONS_V1', JSON.stringify(quotations));
  }, [quotations]);

  const handleQuotationSubmit = (quotationData: Quotation) => {
    if (editingQuotation) {
      setQuotations(prev => prev.map(q => q.id === editingQuotation.id ? quotationData : q));
    } else {
      setQuotations(prev => [...prev, quotationData]);
    }
    setIsQuotationModalOpen(false);
    setEditingQuotation(null);
  };

  const deleteQuotation = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa báo giá này?')) {
      setQuotations(prev => prev.filter(q => q.id !== id));
    }
  };

  const duplicateQuotation = (quotation: Quotation) => {
    const newId = `BG-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const duplicated: Quotation = {
      ...quotation,
      id: newId,
      status: 'MỚI_TẠO',
      date: format(new Date(), 'yyyy-MM-dd'),
      attachments: [],
      history: [{ timestamp: new Date().toISOString(), content: "Sao chép từ báo giá " + quotation.id, user: "Hệ thống" }],
      updatedAt: new Date().toISOString()
    };
    setQuotations(prev => [...prev, duplicated]);
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(CONTRACT_STORAGE_KEY, JSON.stringify(contracts));
  }, [contracts]);

  const handleContractSubmit = (contractData: Contract) => {
    if (editingContract) {
      setContracts(prev => prev.map(c => c.id === editingContract.id ? contractData : c));
    } else {
      if (contracts.some(c => c.id === contractData.id)) {
        alert('Số hợp đồng đã tồn tại!');
        return;
      }
      setContracts(prev => [...prev, contractData]);
    }
    setIsContractModalOpen(false);
    setEditingContract(null);
  };

  const deleteContract = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
      setContracts(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleImportContractSubmit = (contractData: ImportContract) => {
    if (editingImportContract) {
      setImportContracts(prev => prev.map(c => c.id === editingImportContract.id ? contractData : c));
    } else {
      if (importContracts.some(c => c.id === contractData.id)) {
        alert('Số hợp đồng nhập khẩu đã tồn tại!');
        return;
      }
      setImportContracts(prev => [...prev, contractData]);
    }
    setIsImportContractModalOpen(false);
    setEditingImportContract(null);
  };

  const deleteImportContract = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa hợp đồng nhập khẩu này?')) {
      setImportContracts(prev => prev.filter(c => c.id !== id));
    }
  };

  const approvePasswordRequest = (requestId: string) => {
    const request = passwordRequests.find(r => r.id === requestId);
    if (!request) return;

    if (confirm(`Phê duyệt đổi mật khẩu cho tài khoản ${request.username}?`)) {
      // In a real system, we'd update the actual user record.
      // Here we assume "admin" is the only user for now, 
      // or we just update the specific record in storage if it exists.
      // For this demo, let's just mark it as approved.
      // If the username is 'admin', we'll update the local storage password 'LINH_HAN_ADMIN_PW'
      if (request.username === 'admin') {
        localStorage.setItem('LINH_HAN_ADMIN_PW', request.newPasswordHash);
      }

      setPasswordRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'ĐÃ_DUYỆT', approvedAt: new Date().toISOString() } : r
      ));
      alert('Đã phê duyệt yêu cầu. Mật khẩu mới đã được kích hoạt.');
    }
  };

  const rejectPasswordRequest = (requestId: string) => {
    if (confirm('Từ chối yêu cầu đổi mật khẩu này?')) {
      setPasswordRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'TỪ_CHỐI' } : r
      ));
    }
  };

  const handleProductSubmit = (productData: Product) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? productData : p));
    } else {
      if (products.some(p => p.id === productData.id)) {
        alert('Mã sản phẩm đã tồn tại!');
        return;
      }
      setProducts(prev => [...prev, productData]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default password is 'admin123' (hash is btoa('admin123') = 'YWRtaW4xMjM=')
    const storedHashedPassword = localStorage.getItem('LINH_HAN_ADMIN_PW') || btoa('admin123');
    
    if (username === 'admin' && btoa(password) === storedHashedPassword) {
        setIsLoggedIn(true);
        setLoginError('');
    } else {
        setLoginError('Tên đăng nhập hoặc mật khẩu không đúng hoặc chưa được phê duyệt!');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('WELCOME');
    setUsername('');
    setPassword('');
  };

  const handleCommand = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cmd = command.trim().toLowerCase();
    if (!cmd) return;

    setHistory(prev => [...prev, command]);
    
    if (cmd === 'menu') setCurrentView('MENU');
    else if (cmd === 'kho' || cmd === 'bc kho') setCurrentView('KHO');
    else if (cmd === 'hợp đồng' || cmd === 'bc hợp đồng') setCurrentView('HOPDONG');
    else if (cmd === 'nhân sự' || cmd === 'bc nhân sự') setCurrentView('NHANSU');
    else if (cmd === 'doanh thu' || cmd === 'bc doanh thu') setCurrentView('DOANHTHU');
    else if (cmd === 'nhập khẩu' || cmd === 'bc nhập khẩu') setCurrentView('IMPORT_CONTRACT');
    else if (cmd === 'crm' || cmd === 'bc crm') setCurrentView('CRM');
    else if (cmd === 'tổng quan') setCurrentView('DASHBOARD');
    else if (cmd === 'cảnh báo') setCurrentView('ALERT');
    else if (cmd === 'nợ quá hạn') setCurrentView('HOPDONG');
    else if (cmd === 'hàng sắp hết') setCurrentView('KHO');
    else if (cmd === 'kpi tháng') setCurrentView('DOANHTHU');
    else if (cmd === 'top kh') setCurrentView('CRM');
    else if (cmd === 'pipeline') setCurrentView('CRM');
    else {
      // Logic for dynamic adding could go here, but for now we just show a toast or message
    }

    setCommand('');
  };

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const totalToWords = (total: number): string => {
    if (total === 0) return 'Không đồng';
    
    const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
    const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

    const readGroup = (n: number): string => {
        let res = '';
        const hundreds = Math.floor(n / 100);
        const tens = Math.floor((n % 100) / 10);
        const units_digit = n % 10;

        if (hundreds > 0) res += digits[hundreds] + ' trăm ';
        
        if (tens > 1) {
            res += digits[tens] + ' mươi ';
            if (units_digit === 1) res += 'mốt ';
            else if (units_digit === 5) res += 'lăm ';
            else if (units_digit > 0) res += digits[units_digit] + ' ';
        } else if (tens === 1) {
            res += 'mười ';
            if (units_digit === 1) res += 'một ';
            else if (units_digit === 5) res += 'lăm ';
            else if (units_digit > 0) res += digits[units_digit] + ' ';
        } else if (hundreds > 0 && units_digit > 0) {
            res += 'lẻ ' + digits[units_digit] + ' ';
        } else if (units_digit > 0) {
            res += digits[units_digit] + ' ';
        }
        return res;
    };

    let res = '';
    let i = 0;
    let n = Math.floor(total);

    while (n > 0) {
        const group = n % 1000;
        if (group > 0) {
            res = readGroup(group) + units[i] + ' ' + res;
        }
        n = Math.floor(n / 1000);
        i++;
    }

    res = res.trim();
    return res.charAt(0).toUpperCase() + res.slice(1) + ' đồng chẵn.';
  };

  const SidebarItem = ({ icon: Icon, label, cmd, view, isLocked, badge }: any) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 relative group ${
        currentView === view ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
      }`}
      title={isLocked ? "Yêu cầu đăng nhập" : ""}
    >
      <Icon size={20} />
      {isSidebarOpen && <span className="font-medium flex-1 text-left">{label}</span>}
      {isLocked && (
        <span className={`${isSidebarOpen ? '' : 'absolute -top-1 -right-1'} text-amber-500`}>
          <Lock size={isSidebarOpen ? 12 : 10} />
        </span>
      )}
      {badge > 0 && isSidebarOpen && (
        <span className="bg-red-500 text-[10px] font-bold text-white h-4 w-4 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );

  if (!isLoggedIn) {
      if (currentView === 'FORGOT_PW') {
        return (
          <ForgotPasswordView 
            onBack={() => setCurrentView('WELCOME')}
            onComplete={(req: PasswordResetRequest) => setPasswordRequests(prev => [...prev, req])}
          />
        );
      }
      if (currentView === 'PW_APPROVAL') {
        return (
          <PasswordApprovalView 
            requests={passwordRequests}
            onApprove={approvePasswordRequest}
            onReject={rejectPasswordRequest}
            onBack={() => setCurrentView('WELCOME')}
          />
        );
      }

      return (
        <LoginView 
            username={username} 
            setUsername={setUsername} 
            password={password} 
            setPassword={setPassword} 
            onLogin={handleLogin} 
            error={loginError} 
            setView={setCurrentView}
        />
      );
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 relative z-20 print:hidden"
      >
        <div className="p-6 flex items-center justify-between gap-3">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-16 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-lg border border-slate-700/50 p-1">
                <img src={logoHl} alt="HL Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[10px] text-blue-400 tracking-tight leading-tight uppercase">Linh Hân <br/> Production</span>
                <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">V1.0</span>
              </div>
            </div>
          ) : (
             <div className="w-16 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden mx-auto shadow-lg border border-slate-700/50 p-1">
                <img src={logoHl} alt="HL Logo" className="w-full h-full object-contain" />
             </div>
          )}
          {isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white shrink-0">
              <MenuIcon size={20} />
            </button>
          )}
        </div>
        {!isSidebarOpen && (
          <div className="flex justify-center pb-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white">
                <MenuIcon size={20} />
              </button>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem icon={LayoutDashboard} label="Tổng quan" view="DASHBOARD" />
          <SidebarItem icon={FileText} label="Quản lý Báo giá" view="QUOTATION" />
          <SidebarItem icon={Box} label="Quản lý Kho" view="KHO" />
          <SidebarItem icon={FileText} label="Quản lý Hợp đồng" view="HOPDONG" />
          <SidebarItem icon={Truck} label="HĐ Nhập khẩu" view="IMPORT_CONTRACT" isLocked={!isNkLoggedIn} />
          <SidebarItem icon={Users} label="Quản lý Nhân sự" view="NHANSU" />
          <SidebarItem icon={TrendingUp} label="Báo cáo Doanh thu" view="DOANHTHU" />
          <SidebarItem icon={UsersRound} label="Quản lý CRM" view="CRM" />
          <SidebarItem icon={AlertTriangle} label="Tất cả Cảnh báo" view="ALERT" />
          {isNkLoggedIn && (
            <SidebarItem 
              icon={ShieldCheck} 
              label="Quản trị Admin" 
              view="NK_ADMIN" 
              badge={nkRequests.filter(r => r.status === 'pending').length} 
            />
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mb-4">
            <LogOut size={18} />
            {isSidebarOpen && <span className="text-xs font-bold uppercase tracking-tighter">Đăng xuất</span>}
          </button>
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              DT
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-100">D.T. Diễm Tuyết</span>
                <span className="text-[10px] text-slate-500 flex items-center justify-between gap-1">
                    Quản trị
                    <button onClick={() => setIsChangePasswordModalOpen(true)} className="text-blue-500 hover:text-blue-400 p-1" title="Đổi mật khẩu">
                        <Settings size={12} />
                    </button>
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header with Command Bar */}
        <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 z-10 shrink-0 print:hidden">
          <div className="flex items-center gap-10 flex-1">
            <div className="relative flex-1 max-w-2xl">
              <form onSubmit={handleCommand}>
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                  <Terminal size={18} />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Gõ lệnh (Menu, Kho, Hợp đồng...)"
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                />
                <button type="submit" className="absolute right-2 top-1.5 p-1.5 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors">
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex flex-col items-end mr-4">
              <span className="text-[10px] uppercase font-bold text-slate-500"> Hotline hỗ trợ </span>
              <span className="text-sm font-bold text-blue-400">0909720849</span>
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-full transition-colors relative">
               <AlertTriangle size={20} className="text-amber-500" />
               <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>
          </div>
        </header>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
          <AnimatePresence mode="wait">
            {currentView === 'WELCOME' && (
              <WelcomeView key="welcome" onShowMenu={() => setCurrentView('MENU')} />
            )}
            {currentView === 'MENU' && (
              <MenuView key="menu" onNavigate={(view) => setCurrentView(view)} />
            )}
            {currentView === 'DASHBOARD' && (
              <DashboardView key="dashboard" stats={{ products, contracts, employees, customers, quotations }} />
            )}
            {currentView === 'KHO' && (
              <InventoryView 
                key="inventory" 
                products={products} 
                onAdd={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                onEdit={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }}
                onDelete={deleteProduct}
              />
            )}
            {currentView === 'HOPDONG' && (
              <ContractView 
                key="contracts" 
                contracts={contracts} 
                onAdd={() => { setEditingContract(null); setIsContractModalOpen(true); }}
                onEdit={(c) => { setEditingContract(c); setIsContractModalOpen(true); }}
                onDelete={deleteContract}
                onViewDetail={(c) => setViewingContract(c)}
              />
            )}
            {currentView === 'NHANSU' && (
              <HRView 
                employees={employees} 
                onAdd={() => { setEditingEmployee(null); setIsEmployeeModalOpen(true); }}
                onEdit={(emp: any) => { setEditingEmployee(emp); setIsEmployeeModalOpen(true); }}
                onDelete={deleteEmployee}
                onViewDetail={(emp: any) => setViewingEmployee(emp)}
                onUpdateAttendance={(id: string, record: any) => {
                  setEmployees(employees.map(e => {
                    if (e.id === id) {
                      const existing = e.attendance.find(a => a.monthYear === record.monthYear);
                      const newAttendance = existing 
                        ? e.attendance.map(a => a.monthYear === record.monthYear ? record : a)
                        : [...e.attendance, record];
                      return { ...e, attendance: newAttendance };
                    }
                    return e;
                  }));
                }}
              />
            )}
            {currentView === 'DOANHTHU' && (
              <RevenueView key="revenue" />
            )}
            {currentView === 'CRM' && (
              <CRMView key="crm" customers={customers} />
            )}
            {currentView === 'IMPORT_CONTRACT' && (
              <>
                {isNkLoggedIn ? (
                  <ImportContractView 
                    key="import_contracts" 
                    contracts={importContracts} 
                    onAdd={() => { setEditingImportContract(null); setIsImportContractModalOpen(true); }}
                    onEdit={(c) => { setEditingImportContract(c); setIsImportContractModalOpen(true); }}
                    onDelete={deleteImportContract}
                    onViewDetail={(c) => setViewingImportContract(c)}
                  />
                ) : (
                  <ImportLoginOverlay 
                    onLogin={() => { loginNK(); setCurrentView('IMPORT_CONTRACT'); }}
                    onForgotPassword={() => setCurrentView('FORGOT_PW_NK')}
                    onClose={() => setCurrentView('MENU')}
                  />
                )}
              </>
            )}
            {currentView === 'FORGOT_PW_NK' && (
              <ImportForgotPasswordView 
                onSubmit={(req: any) => setNkRequests(prev => [...prev, req])}
                onBack={() => setCurrentView('IMPORT_CONTRACT')}
              />
            )}
            {currentView === 'NK_ADMIN' && (
              <NKAdminPanel 
                requests={nkRequests}
                onApprove={approveNKRequest}
                onReject={rejectNKRequest}
              />
            )}
            {currentView === 'QUOTATION' && (
              <QuotationView 
                quotations={quotations}
                onAdd={() => { setEditingQuotation(null); setIsQuotationModalOpen(true); }}
                onEdit={(q) => { setEditingQuotation(q); setIsQuotationModalOpen(true); }}
                onDelete={deleteQuotation}
                onDuplicate={duplicateQuotation}
                onViewDetail={(q) => setViewingQuotation(q)}
              />
            )}
            {currentView === 'ALERT' && (
              <AlertView key="alerts" data={{ products, contracts }} />
            )}
          </AnimatePresence>
        </div>

        <ProductModal 
          isOpen={isProductModalOpen} 
          onClose={() => setIsProductModalOpen(false)} 
          onSubmit={handleProductSubmit}
          editingProduct={editingProduct}
        />

        <ContractModal 
          isOpen={isContractModalOpen} 
          onClose={() => setIsContractModalOpen(false)} 
          onSubmit={handleContractSubmit}
          editingContract={editingContract}
        />

        <ContractDetailModal 
          isOpen={!!viewingContract} 
          onClose={() => setViewingContract(null)} 
          contract={viewingContract}
        />

        <EmployeeModal 
          isOpen={isEmployeeModalOpen}
          onClose={() => setIsEmployeeModalOpen(false)}
          onSubmit={handleEmployeeSubmit}
          editingEmployee={editingEmployee}
        />

        <EmployeeDetailModal
          isOpen={!!viewingEmployee}
          onClose={() => setViewingEmployee(null)}
          employee={viewingEmployee}
        />

        <QuotationModal 
          isOpen={isQuotationModalOpen}
          onClose={() => setIsQuotationModalOpen(false)}
          onSubmit={handleQuotationSubmit}
          editingQuotation={editingQuotation}
          employees={employees}
        />

        <QuotationDetailModal 
          isOpen={!!viewingQuotation}
          onClose={() => setViewingQuotation(null)}
          quotation={viewingQuotation}
        />

        <ImportContractModal 
          isOpen={isImportContractModalOpen}
          onClose={() => setIsImportContractModalOpen(false)}
          onSubmit={handleImportContractSubmit}
          editingContract={editingImportContract}
        />

        <ImportContractDetailModal 
          isOpen={!!viewingImportContract}
          onClose={() => setViewingImportContract(null)}
          contract={viewingImportContract}
        />

        <ChangePasswordModal 
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
          onSubmit={handleChangePassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
        />
        
        {/* Footer info */}
        <footer className="h-8 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-8 text-[10px] text-slate-500 shrink-0">
          <span>Công ty TNHH Đầu tư Sản xuất Linh Hân</span>
          <span>© 2026 Admin: Đặng Thị Diễm Tuyết | 0909720849</span>
        </footer>
      </main>
    </div>
  );
}

// Sub-components for views

const WelcomeView = ({ onShowMenu }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="flex flex-col items-center justify-center min-h-[60vh] text-center"
  >
    <div className="bg-slate-900 border-2 border-blue-500/30 p-12 rounded-3xl shadow-2xl relative overflow-hidden group">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-1000"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
      
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 12, delay: 0.2 }}
        className="mb-8 inline-block p-2 bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-blue-500/10"
      >
        <img src={logoHl} alt="HL Logo" className="w-48 h-24 object-contain" />
      </motion.div>
      
      <h1 className="text-4xl font-extrabold mb-2 text-white tracking-tight">
        CÔNG TY TNHH ĐẦU TƯ SẢN XUẤT LINH HÂN
      </h1>
      <p className="text-blue-400 font-bold text-lg mb-6 tracking-wide">
        Phần mềm Quản lý Doanh nghiệp – Phiên bản 1.0
      </p>
      
      <div className="border-t border-slate-800 pt-6 mt-6 space-y-2">
        <p className="text-slate-400">Quản trị: <span className="text-slate-100 font-bold">Đặng Thị Diễm Tuyết</span></p>
        <p className="text-slate-400 flex items-center justify-center gap-2">
          <Phone size={16} className="text-blue-400" />
          <span className="text-slate-100 font-bold">0909720849</span>
        </p>
      </div>
      
      <button 
        onClick={onShowMenu}
        className="mt-10 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
      >
        Bắt đầu làm việc <ChevronRight size={20} />
      </button>
      
      <p className="mt-8 text-xs text-slate-500 animate-pulse">
        Gõ "Menu" để xem toàn bộ chức năng
      </p>
    </div>
  </motion.div>
);

const MenuView = ({ onNavigate }: any) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="max-w-4xl mx-auto"
  >
    <div className="mb-10">
      <h2 className="text-3xl font-bold mb-2 text-white">Danh sách Chức năng</h2>
      <p className="text-slate-400">Hệ thống ERP đồng bộ toàn bộ hoạt động của Linh Hân</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { id: 'QUOTATION', label: 'Quản lý Báo giá', icon: FileText, color: 'bg-blue-600', cmd: 'Báo giá', desc: 'Lập báo giá dự án, theo dõi tỉ lệ chốt.' },
        { id: 'KHO', label: 'Quản lý Kho hàng', icon: Box, color: 'bg-orange-500', cmd: 'Kho', desc: 'Nhập xuất tồn, cảnh báo hàng sắp hết.' },
        { id: 'HOPDONG', label: 'Quản lý Hợp đồng', icon: FileText, color: 'bg-blue-500', cmd: 'Hợp đồng', desc: 'Theo dõi tiến độ, thanh toán và nợ.' },
        { id: 'IMPORT_CONTRACT', label: 'HĐ Nhập khẩu', icon: Truck, color: 'bg-cyan-600', cmd: 'Nhập khẩu', desc: 'Quản lý hợp đồng ngoại, logistic & bảo hành.' },
        { id: 'NHANSU', label: 'Quản lý Nhân sự', icon: Users, color: 'bg-green-500', cmd: 'Nhân sự', desc: 'Hồ sơ, chấm công, nghỉ phép nhân viên.' },
        { id: 'DOANHTHU', label: 'Báo cáo Doanh thu', icon: TrendingUp, color: 'bg-emerald-500', cmd: 'Doanh thu', desc: 'Phân tích doanh số, lợi nhuận và KPI.' },
        { id: 'CRM', label: 'Quản lý Khách hàng', icon: UsersRound, color: 'bg-indigo-500', cmd: 'CRM', desc: 'Hồ sơ KH, pipeline bán hàng, chăm sóc.' },
        { id: 'DASHBOARD', label: 'Tổng quan Dashboard', icon: LayoutDashboard, color: 'bg-purple-500', cmd: 'Tổng quan', desc: 'Dữ liệu trực quan hóa toàn công ty.' },
        { id: 'ALERT', label: 'Tất cả cảnh báo', icon: AlertTriangle, color: 'bg-red-500', cmd: 'Cảnh báo', desc: 'Mục cần ưu tiên xử lý ngay.' },
      ].map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          onClick={() => onNavigate(item.id)}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}>
            <item.icon size={24} />
          </div>
          <h3 className="font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors">{item.label}</h3>
          <p className="text-slate-500 text-xs mb-4">{item.desc}</p>
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Lệnh: <span className="text-blue-400">"{item.cmd}"</span></span>
            <ChevronRight size={16} className="text-slate-600 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const LoginView = ({ username, setUsername, password, setPassword, onLogin, error, setView }: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[100px] animate-pulse"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="p-1 bg-white rounded-2xl shadow-xl border-2 border-blue-500/10 overflow-hidden">
             <img src={logoHl} alt="HL Logo" className="w-32 h-16 object-contain" />
          </div>
        </div>
        
        <div className="text-center mb-8 text-white">
          <h1 className="text-2xl font-extrabold tracking-tight uppercase">Linh Hân Production</h1>
          <p className="text-slate-500 text-sm mt-1">Hệ thống Quản lý Đầu tư Sản xuất</p>
        </div>

        <form onSubmit={onLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Tên đăng nhập</label>
              <div className="relative text-white">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Nhập username"
                    required
                  />
              </div>
            </div>
            
            <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Mật khẩu</label>
                    <button type="button" onClick={() => setView('FORGOT_PW')} className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors">Quên mật khẩu?</button>
                </div>
                <div className="relative text-white">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-12 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      placeholder="Nhập mật khẩu"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs font-bold text-center bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                    {error}
                </motion.div>
            )}

            <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95">
                Đăng nhập hệ thống
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setView('PW_APPROVAL')} className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">Trang duyệt yêu cầu (Admin)</button>
            </div>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
           <p className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mb-1">Hỗ trợ kỹ thuật</p>
           <p className="text-sm font-bold text-blue-400">0909720849 (D.T. Diễm Tuyết)</p>
        </div>
      </motion.div>
    </div>
  );
};

const ForgotPasswordView = ({ onBack, onComplete }: any) => {
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const getStrength = (pw: string) => {
    let score = 0;
    if (!pw) return 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Z0-9]/i.test(pw)) score++;
    return score;
  };

  const strength = getStrength(newPassword);
  const strengthLabels = ["Rất yếu", "Trung bình", "Khá mạnh", "Mạnh"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-blue-500", "bg-green-500"];

  const rules = [
    { label: "Ít nhất 8 ký tự", met: newPassword.length >= 8 },
    { label: "Có ít nhất 1 chữ hoa (A–Z)", met: /[A-Z]/.test(newPassword) },
    { label: "Có ít nhất 1 chữ số (0–9)", met: /[0-9]/.test(newPassword) },
    { label: "Có ít nhất 1 ký tự đặc biệt (!@#$%...)", met: /[^A-Z0-9]/i.test(newPassword) }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strength < 4) {
      alert('Mật khẩu chưa đủ mạnh theo yêu cầu!');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu nhập lại không khớp!');
      return;
    }

    const requestId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const request: PasswordResetRequest = {
      id: requestId,
      username: identifier,
      newPasswordHash: btoa(newPassword), // Simple hash as requested
      requestedAt: new Date().toISOString(),
      status: 'CHỜ_DUYỆT'
    };

    if (onComplete) onComplete(request);

    // Open mailto
    const subject = `[Yêu cầu đổi mật khẩu] - Tài khoản: ${identifier}`;
    const body = `Yêu cầu đổi mật khẩu cho tài khoản/email: ${identifier}\nThời gian: ${format(new Date(), 'dd/MM/yyyy HH:mm')}\nHướng dẫn: Vui lòng truy cập hệ thống để phê duyệt cho tài khoản này.`;
    window.location.href = `mailto:hoikhanhdorfr.vn@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    setStep(2);
  };

  if (step === 2) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-white">Yêu cầu đã được gửi thành công</h2>
          <div className="space-y-4 text-slate-400 text-sm mb-8">
            <p>Hệ thống đã ghi nhận yêu cầu của bạn.</p>
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 font-bold text-slate-200">
               hoikhanhdorfr.vn@gmail.com
            </div>
            <p className="italic">Mật khẩu sẽ được kích hoạt sau khi quản trị viên phê duyệt. Vui lòng kiểm tra email để nhận thông báo xác nhận.</p>
          </div>
          <button 
            onClick={onBack}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95"
          >
            Quay lại đăng nhập
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-2 text-center text-white">Quên mật khẩu?</h2>
        <p className="text-slate-500 text-sm mb-8 text-center">Cung cấp thông tin để tạo yêu cầu khôi phục</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Định danh tài khoản *</label>
            <div className="relative text-white">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
              <input 
                type="text" 
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="Tên đăng nhập hoặc Email" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Mật khẩu mới *</label>
              <div className="relative text-white">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới" 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Strength Meter */}
              <div className="space-y-2 mt-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-500 uppercase tracking-tighter">Độ mạnh:</span>
                  <span className={strength === 0 ? "text-slate-600" : strengthColors[strength - 1].replace("bg-", "text-")}>
                    {strength === 0 ? "Chưa nhập" : strengthLabels[strength - 1]}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-full flex-1 rounded-full transition-all duration-500 ${strength >= i ? strengthColors[strength - 1] : "bg-slate-700"}`}></div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3">
                  {rules.map((rule, idx) => (
                    <div key={idx} className={`flex items-center gap-1.5 text-[9px] font-bold ${rule.met ? 'text-green-500' : 'text-slate-600'}`}>
                      {rule.met ? <CheckCircle size={10} /> : <div className="w-2.5 h-2.5 border-2 border-slate-700 rounded-full"></div>}
                      {rule.met && <span className="opacity-50">✓</span>} {rule.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Xác nhận mật khẩu *</label>
              <div className="relative text-white">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu" 
                  className={`w-full bg-slate-800 border ${confirmPassword ? (newPassword === confirmPassword ? 'border-green-500' : 'border-red-500') : 'border-slate-700'} rounded-xl py-3 pl-12 pr-12 text-sm focus:ring-2 outline-none`}
                  required
                />
                {confirmPassword && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {newPassword === confirmPassword ? <CheckCircle size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-red-500" />}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2"
          >
            Gửi yêu cầu đổi mật khẩu <ChevronRight size={18} />
          </button>
          
          <button type="button" onClick={onBack} className="w-full text-slate-500 hover:text-slate-300 text-xs font-bold transition-colors">Quay lại đăng nhập</button>
        </form>
      </motion.div>
    </div>
  );
};

const PasswordApprovalView = ({ requests, onApprove, onReject, onBack }: any) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
              <ShieldCheck className="text-blue-500" /> Phê duyệt yêu cầu Đổi mật khẩu
            </h2>
            <p className="text-slate-500 text-sm italic mt-1">(Dành riêng cho Quản trị viên phê duyệt các yêu cầu)</p>
          </div>
          <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-white"><X size={24}/></button>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-[10px] uppercase tracking-wider">
                  <th className="p-4 font-black w-12">STT</th>
                  <th className="p-4 font-black">Tài khoản / Email</th>
                  <th className="p-4 font-black text-center">Thời gian gửi</th>
                  <th className="p-4 font-black text-center">Trạng thái</th>
                  <th className="p-4 font-black text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {requests.map((r: PasswordResetRequest, idx: number) => (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4 text-slate-500 font-bold">{idx + 1}</td>
                    <td className="p-4 font-bold text-white">{r.username}</td>
                    <td className="p-4 text-center text-xs text-slate-400">{format(parseISO(r.requestedAt), 'dd/MM/yyyy HH:mm')}</td>
                    <td className="p-4 text-center">
                      {r.status === 'CHỜ_DUYỆT' && <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-black uppercase">Chờ duyệt</span>}
                      {r.status === 'ĐÃ_DUYỆT' && (
                        <div className="flex flex-col items-center">
                          <span className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-black uppercase">Đã duyệt</span>
                          <span className="text-[8px] text-slate-500 uppercase mt-1">{format(parseISO(r.approvedAt!), 'dd/MM/yyyy HH:mm')}</span>
                        </div>
                      )}
                      {r.status === 'TỪ_CHỐI' && <span className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-black uppercase">Từ chối</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                         {r.status === 'CHỜ_DUYỆT' && (
                           <>
                              <button onClick={() => onApprove(r.id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-[10px] font-black uppercase transition-all shadow-lg active:scale-95">Phê duyệt</button>
                              <button onClick={() => onReject(r.id)} className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-[10px] font-black uppercase transition-all active:scale-95">Từ chối</button>
                           </>
                         )}
                         {r.status !== 'CHỜ_DUYỆT' && <span className="text-[10px] text-slate-600 italic">Hệ thống đã xử lý</span>}
                      </div>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-600 italic text-sm">
                      Hiện chưa có yêu cầu khôi phục mật khẩu nào cần xử lý.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-800 text-center">
           <button onClick={onBack} className="text-slate-500 hover:text-blue-400 font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto">
             <ChevronRight size={16} className="rotate-180" /> Quay lại Đăng nhập
           </button>
        </div>
      </motion.div>
    </div>
  );
};

const ImportLoginOverlay = ({ onLogin, onForgotPassword, onClose }: any) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPass = localStorage.getItem(NK_PASSWORD_KEY) || btoa('Admin@123');
    if (user === 'admin' && btoa(pass) === storedPass) {
      onLogin();
    } else {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-900/30">
            <Ship size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">HĐ Nhập khẩu</h2>
          <p className="text-slate-500 text-sm italic mt-1">Vui lòng đăng nhập để truy cập</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Tên đăng nhập</label>
            <div className="relative text-white">
              <UserIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
              <input 
                type="text" 
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="Nhập tên đăng nhập" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Mật khẩu</label>
            <div className="relative text-white">
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <input 
                type={showPass ? "text" : "password"} 
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="Nhập mật khẩu" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 px-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-red-400 text-xs font-bold text-center bg-red-400/10 p-2 rounded-lg border border-red-500/20"
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            Đăng nhập
          </button>

          <div className="text-center">
            <button 
              type="button" 
              onClick={onForgotPassword} 
              className="text-[10px] font-black uppercase text-slate-500 hover:text-blue-500 transition-all tracking-widest"
            >
              Quên mật khẩu?
            </button>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="w-full py-3.5 border border-slate-700 hover:bg-slate-800 text-slate-400 rounded-xl font-bold text-xs transition-all mt-2"
          >
            Đóng
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const ImportForgotPasswordView = ({ onSubmit, onBack }: any) => {
  const [username, setUsername] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getStrength = (pw: string) => {
    let score = 0;
    if (!pw) return 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Z0-9]/i.test(pw)) score++;
    return score;
  };

  const strength = getStrength(newPass);
  const strengthLabels = ["Rất yếu", "Trung bình", "Khá mạnh", "Mạnh"];
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-blue-500", "bg-green-500"];

  const rules = [
    { label: "Ít nhất 8 ký tự", met: newPass.length >= 8 },
    { label: "Có ít nhất 1 chữ hoa (A–Z)", met: /[A-Z]/.test(newPass) },
    { label: "Có ít nhất 1 chữ số (0–9)", met: /[0-9]/.test(newPass) },
    { label: "Có ít nhất 1 ký tự đặc biệt (!@#$%...)", met: /[^A-Z0-9]/i.test(newPass) }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
        alert('Vui lòng điền tên đăng nhập');
        return;
    }
    if (newPass.length < 8) {
      alert('Mật khẩu phải đạt ít nhất 8 ký tự');
      return;
    }
    if (newPass !== confirmPass) {
      alert('Mật khẩu nhập lại không khớp');
      return;
    }

    const requestedAt = format(new Date(), 'dd/MM/yyyy HH:mm');
    const request = {
      id: "REQ" + Date.now(),
      username,
      newPassword: btoa(newPass),
      requestedAt,
      status: 'pending' as const
    };

    // Trigger mailto
    const adminEmail = 'hoikhanhdorfr.vn@gmail.com';
    const subject = encodeURIComponent(`[Yêu cầu đổi mật khẩu] - Tài khoản: ${username}`);
    const body = encodeURIComponent(
      `Kính gửi Quản trị viên,\n\nCó yêu cầu đổi mật khẩu từ:\n- Tài khoản: ${username}\n- Thời gian: ${requestedAt}\n\nVui lòng vào mục Quản trị Admin để phê duyệt.\n\nTrân trọng.`
    );
    window.location.href = `mailto:${adminEmail}?subject=${subject}&body=${body}`;

    onSubmit(request);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Yêu cầu đã được gửi</h2>
          <div className="flex justify-center mb-6">
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase rounded-lg border border-blue-500/30 tracking-widest">
              hoikhanhdorfr.vn@gmail.com
            </span>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mb-8 text-amber-500 text-xs font-medium leading-relaxed italic">
            Mật khẩu sẽ được kích hoạt sau khi quản trị viên phê duyệt. Vui lòng kiểm tra email để nhận thông báo xác nhận.
          </div>
          <button 
            onClick={onBack}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <ArrowDownLeft size={18} className="rotate-90" /> Quay lại đăng nhập
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-y-auto max-h-full scrollbar-hide"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-900/30">
            <History size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Quên mật khẩu</h2>
          <p className="text-slate-500 text-sm italic mt-1">Điền thông tin để gửi yêu cầu đến quản trị viên</p>
        </div>

        <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl mb-6 text-blue-400 text-[10px] font-bold leading-relaxed">
          <p className="uppercase tracking-widest mb-1 flex items-center gap-2">
            <Mail size={12} /> Yêu cầu sẽ được gửi đến:
          </p>
          <p className="text-blue-300 text-xs font-black">hoikhanhdorfr.vn@gmail.com</p>
          <p className="mt-2 opacity-70 italic font-normal">Mật khẩu mới chỉ được kích hoạt sau khi quản trị viên phê duyệt.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Tên đăng nhập / Email *</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập hoặc email tài khoản" 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all placeholder:text-slate-600"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Mật khẩu mới *</label>
            <div className="relative text-white">
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <input 
                type={showPass ? "text" : "password"} 
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Nhập mật khẩu mới" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3.5 px-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>
            
            <div className="flex gap-1.5 mt-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${strength >= i ? strengthColors[strength - 1] : 'bg-slate-800'}`}></div>
              ))}
            </div>
            <div className="flex justify-between items-center text-[10px] mt-1 pr-1 font-black uppercase tracking-tighter">
               <span className="text-slate-600">Độ mạnh:</span>
               <span className={`${strength > 0 ? strengthColors[strength-1].replace('bg-', 'text-') : 'text-slate-600'}`}>
                 {strength > 0 ? strengthLabels[strength-1] : '...'}
               </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 bg-slate-800/30 p-3 rounded-xl border border-slate-800">
              {rules.map((rule, idx) => (
                <div key={idx} className={`flex items-center gap-2 text-[9px] font-bold transition-colors ${rule.met ? 'text-green-500' : 'text-slate-600'}`}>
                  {rule.met ? <CheckCircle2 size={12} /> : <div className="w-2.5 h-2.5 border border-slate-700 rounded-full"></div>}
                  {rule.label}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 ml-1 tracking-widest">Xác nhận mật khẩu mới *</label>
            <div className="relative text-white">
              <button 
                type="button" 
                onClick={() => setShowConfirmPass(!showConfirmPass)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <input 
                type={showConfirmPass ? "text" : "password"} 
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Xác nhận mật khẩu mới" 
                className={`w-full bg-slate-800 border ${confirmPass ? (newPass === confirmPass ? 'border-green-500' : 'border-red-500') : 'border-slate-700'} rounded-xl py-3.5 px-4 pr-12 text-sm focus:ring-2 outline-none transition-all placeholder:text-slate-600`}
                required
              />
              {confirmPass && newPass === confirmPass && (
                <CheckCircle2 size={18} className="absolute right-12 top-1/2 -translate-y-1/2 text-green-500" />
              )}
            </div>
            {confirmPass && newPass !== confirmPass && (
              <p className="text-[10px] text-red-500 font-bold ml-1 animate-pulse">Mật khẩu xác nhận không khớp</p>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            <Send size={18} /> Gửi yêu cầu đổi mật khẩu
          </button>

          <button 
            type="button" 
            onClick={onBack}
            className="w-full py-3.5 border border-slate-700 hover:bg-slate-800 text-slate-400 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <ChevronRight size={18} className="rotate-180" /> Quay lại đăng nhập
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const NKAdminPanel = ({ requests, onApprove, onReject }: any) => {
  const pendingCount = requests.filter((r: any) => r.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-4 tracking-tight">
            Quản trị Admin 
            {pendingCount > 0 && (
              <span className="text-xs bg-amber-500 text-slate-900 px-3 py-1 rounded-full font-black animate-pulse shadow-lg shadow-amber-500/20">
                {pendingCount} Yêu cầu mới
              </span>
            )}
          </h2>
          <p className="text-slate-500 mt-1 italic">Phê duyệt các yêu cầu thay đổi mật khẩu hệ thống Nhập khẩu</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-800">
                <th className="p-6">STT</th>
                <th className="p-6">Tài khoản</th>
                <th className="p-6">Thời gian gửi</th>
                <th className="p-6">Trạng thái</th>
                <th className="p-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {requests.map((r: any, idx: number) => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition-all group">
                  <td className="p-6 text-slate-500 font-bold">{idx + 1}</td>
                  <td className="p-6">
                    <div className="font-bold text-white text-base">{r.username}</div>
                    <div className="text-[9px] text-slate-600 font-mono mt-1 opacity-50">REQ_ID: {r.id}</div>
                  </td>
                  <td className="p-6">
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                       <Clock size={14} className="text-slate-600" />
                       {r.requestedAt}
                    </div>
                  </td>
                  <td className="p-6">
                    {r.status === 'pending' && <span className="px-4 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-inner">Chờ duyệt</span>}
                    {r.status === 'approved' && <span className="px-4 py-1.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-inner">Đã duyệt</span>}
                    {r.status === 'rejected' && <span className="px-4 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-inner">Từ chối</span>}
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end gap-3">
                       {r.status === 'pending' ? (
                         <>
                            <button 
                              onClick={() => onApprove(r)}
                              className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase bg-green-600 hover:bg-green-500 text-white transition-all shadow-lg shadow-green-600/20 active:scale-95 flex items-center gap-2"
                            >
                              <CheckCircle size={14} /> Duyệt
                            </button>
                            <button 
                              onClick={() => onReject(r.id)}
                              className="px-6 py-2.5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 flex items-center gap-2"
                            >
                              <XCircle size={14} /> Từ chối
                            </button>
                         </>
                       ) : (
                         <div className="flex items-center gap-2 text-slate-600 italic text-xs font-medium">
                            <ShieldCheck size={14} /> Hệ thống đã xử lý
                         </div>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-32 text-center text-slate-600 italic">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                       <Mail size={48} />
                       <p className="text-sm font-bold uppercase tracking-widest">Chưa có yêu cầu đổi mật khẩu nào.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProductModal = ({ isOpen, onClose, onSubmit, editingProduct }: { isOpen: boolean, onClose: () => void, onSubmit: (p: Product) => void, editingProduct: Product | null }) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    id: '', name: '', imageUrl: '', category: '', remainingStockNote: '', unit: '',
    importPrice: 0, importQuantity: 0, importDate: format(new Date(), 'yyyy-MM-dd'),
    expiryDate: '', warranty: '', soldQuantity: 0, note: ''
  });

  useEffect(() => {
    if (editingProduct) setFormData(editingProduct);
    else setFormData({
      id: `SP${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      name: '', imageUrl: '', category: '', remainingStockNote: '', unit: 'kg',
      importPrice: 0, importQuantity: 0, importDate: format(new Date(), 'yyyy-MM-dd'),
      expiryDate: '', warranty: '', soldQuantity: 0, note: ''
    });
  }, [editingProduct, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
          <h3 className="text-xl font-bold flex items-center gap-2">
            {editingProduct ? <FileEdit className="text-blue-400" /> : <Plus className="text-emerald-400" />}
            {editingProduct ? 'Chỉnh sửa hàng hóa' : 'Nhập hàng hóa mới'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form className="p-8 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => {
          e.preventDefault();
          if (formData.soldQuantity! > formData.importQuantity!) {
             alert('Khối lượng đã bán không được lớn hơn khối lượng nhập!');
             return;
          }
          onSubmit(formData as Product);
        }}>
          {/* Left Column */}
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hình ảnh sản phẩm</label>
              <div className="flex gap-4 items-start">
                <div className="w-32 h-32 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden relative group">
                  {formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : <ImageIcon size={32} className="text-slate-600" />}
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="text-[10px] font-bold text-white uppercase">Thay đổi</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
                <div className="flex-1 space-y-2">
                   <p className="text-[10px] text-slate-500 italic leading-relaxed">Chọn ảnh đại diện cho hàng hóa. Hỗ trợ JPG, PNG, WEBP. Ảnh được lưu dưới dạng Base64.</p>
                   <input type="file" className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500" accept="image/*" onChange={handleImageChange} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField label="Mã sản phẩm" value={formData.id} onChange={v => setFormData({...formData, id: v})} placeholder="Mã SP..." required disabled={!!editingProduct} />
              <InputField label="Tên hàng hóa" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Tên sản phẩm..." required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Danh mục" value={formData.category} onChange={v => setFormData({...formData, category: v})} options={['Linh kiện máy tính', 'Máy vi tính', 'Thiết bị văn phòng']} />
              <InputField label="Đơn vị tính" value={formData.unit} onChange={v => setFormData({...formData, unit: v})} placeholder="kg, cái, thùng..." required />
            </div>

            <InputField label="Khối lượng còn lại" value={formData.remainingStockNote} onChange={v => setFormData({...formData, remainingStockNote: v})} placeholder="Thông tin tồn..." />
            <InputField label="Bảo hành" value={formData.warranty} onChange={v => setFormData({...formData, warranty: v})} icon={ShieldCheck} placeholder="12 tháng, 24 tháng..." />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Khối lượng nhập" type="number" value={formData.importQuantity} onChange={v => setFormData({...formData, importQuantity: Number(v)})} required icon={ArrowDownLeft} />
              <InputField label="Khối lượng đã bán" type="number" value={formData.soldQuantity} onChange={v => setFormData({...formData, soldQuantity: Number(v)})} icon={ArrowUpRight} />
            </div>

            <InputField label="Đơn giá nhập (VNĐ)" type="number" value={formData.importPrice} onChange={v => setFormData({...formData, importPrice: Number(v)})} required icon={Tag} />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Ngày nhập hàng" type="date" value={formData.importDate} onChange={v => setFormData({...formData, importDate: v})} icon={Calendar} />
              <InputField label="Hạn sử dụng/BH" type="date" value={formData.expiryDate} onChange={v => setFormData({...formData, expiryDate: v})} icon={Clock} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ghi chú nội bộ</label>
              <textarea 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] resize-none"
                placeholder="Nhập ghi chú thêm..."
                value={formData.note}
                onChange={e => setFormData({...formData, note: e.target.value})}
              />
            </div>

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-700 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-all">Hủy bỏ</button>
              <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/40 transition-all">Lưu thông tin</button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = 'text', placeholder, required, icon: Icon, disabled, multiline }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label} {required && <span className="text-red-500">*</span>}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />}
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-slate-800 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all p-4 min-h-[100px] resize-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      ) : (
        <input 
          type={type} 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-slate-800 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all py-2.5 ${Icon ? 'pl-10' : 'px-4'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
      )}
    </div>
  </div>
);

const SelectField = ({ label, value, onChange, options }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
    <select 
      value={value} 
      onChange={e => onChange(e.target.value)}
      className="w-full bg-slate-800 border border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all py-2.5 px-4 appearance-none"
    >
      <option value="">Chọn danh mục...</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const InventoryView = ({ products, onAdd, onEdit, onDelete }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const stats = {
    total: products.length,
    importWeight: products.reduce((acc, p) => acc + (p.importQuantity || 0), 0),
    soldWeight: products.reduce((acc, p) => acc + (p.soldQuantity || 0), 0),
    stockWeight: products.reduce((acc, p) => acc + ((p.importQuantity || 0) - (p.soldQuantity || 0)), 0),
  };

  const getStatus = (p: Product) => {
    const stock = p.importQuantity - p.soldQuantity;
    const percent = (stock / p.importQuantity) * 100;
    if (stock <= 0) return { label: 'Hết hàng', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' };
    if (percent < 20) return { label: 'Sắp hết', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' };
    return { label: 'Còn hàng', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' };
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    const status = getStatus(p).label;
    const matchesStatus = !filterStatus || status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Tổng sản phẩm" value={stats.total} icon={Layers} color="blue" subtitle="Trong danh mục" />
        <StatCard label="Tổng KL nhập" value={stats.importWeight.toLocaleString()} icon={ArrowDownLeft} color="orange" subtitle="Đơn vị: kg/cái" />
        <StatCard label="Tổng đã bán" value={stats.soldWeight.toLocaleString()} icon={ArrowUpRight} color="emerald" subtitle="Khối lượng xuất" />
        <StatCard label="Tổng tồn kho" value={stats.stockWeight.toLocaleString()} icon={Package} color="indigo" subtitle="Hiện có thực tế" />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 flex items-center gap-4 w-full">
          <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input 
              type="text" 
              placeholder="Tìm theo tên hoặc mã SP..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          <select 
            className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-6 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="">Tất cả danh mục</option>
            <option value="Linh kiện máy tính">Linh kiện máy tính</option>
            <option value="Máy vi tính">Máy vi tính</option>
            <option value="Thiết bị văn phòng">Thiết bị văn phòng</option>
          </select>
          <select 
            className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-6 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Còn hàng">Còn hàng</option>
            <option value="Sắp hết">Sắp hết</option>
            <option value="Hết hàng">Hết hàng</option>
          </select>
        </div>
        <button 
          onClick={onAdd}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-900/40 transition-all shrink-0 w-full md:w-auto justify-center"
        >
          <Plus size={20} /> Nhập hàng mới
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2 tracking-tight">
            <Layers className="text-blue-400" size={18} /> DANH SÁCH HÀNG HÓA KHO
          </h3>
          <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-widest">
            {filteredProducts.length} mặt hàng được tìm thấy
          </span>
        </div>
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800/40 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Sản phẩm</th>
                <th className="px-6 py-4">Phân loại / Bảo hành</th>
                <th className="px-6 py-4 text-right">KL Nhập</th>
                <th className="px-6 py-4 text-right">Khối lượng còn lại</th>
                <th className="px-6 py-4">Mức tồn kho</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Đơn giá</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.map(p => {
                const stock = p.importQuantity - p.soldQuantity;
                const percent = Math.min(Math.max((stock / p.importQuantity) * 100, 0), 100);
                const status = getStatus(p);

                return (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-[36px] h-[36px] rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          {p.imageUrl ? (
                             <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : <ImageIcon size={16} className="text-slate-600" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-100">{p.name}</span>
                          <span className="text-[10px] text-blue-400 font-mono font-bold tracking-wider">#{p.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-300 font-medium">{p.category}</span>
                        <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold mt-0.5">
                           <ShieldCheck size={10} /> {p.warranty || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-200">
                      {p.importQuantity.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal ml-0.5">{p.unit}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-orange-400">
                      {p.remainingStockNote || stock.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal ml-0.5">{p.unit}</span>
                    </td>
                    <td className="px-6 py-4 min-w-[150px]">
                      <div className="flex flex-col gap-1.5">
                         <div className="flex justify-between text-[9px] font-bold">
                            <span className="text-slate-500 uppercase">Còn {stock.toLocaleString()} {p.unit}</span>
                            <span className={status.color}>{Math.round(percent)}%</span>
                         </div>
                         <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              className={`h-full rounded-full ${percent < 20 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : percent < 50 ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}
                            />
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-tight border ${status.bg} ${status.color} ${status.border}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-blue-400 tracking-tight">
                       {p.importPrice.toLocaleString()}đ
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => onEdit(p)}
                          className="p-2 bg-slate-800 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(p.id)}
                          className="p-2 bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                       <Package size={48} />
                       <p className="text-sm font-bold uppercase tracking-widest">Không tìm thấy sản phẩm nào</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ContractModal = ({ isOpen, onClose, onSubmit, editingContract }: { isOpen: boolean, onClose: () => void, onSubmit: (c: Contract) => void, editingContract: Contract | null }) => {
  const [formData, setFormData] = useState<Partial<Contract>>({
    id: '', name: '', customer: '', representative: '', sideB: 'Công ty TNHH Đầu tư Sản xuất Linh Hân',
    type: 'CUNG_CAP', value: 0, signDate: format(new Date(), 'yyyy-MM-dd'),
    startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '', note: '',
    performanceGuaranteeAmount: 0, performanceGuaranteeIssueDate: '', performanceGuaranteeExpiryDate: '', performanceGuaranteeStatus: 'PENDING',
    bidGuaranteeAmount: 0, bidGuaranteeStatus: 'DONE', bidGuaranteeRefundDate: '',
    paidAmount: 0, isOverdueDebt: false, overdueAmount: 0, overdueDate: '',
    acceptanceStatus: 'NO', acceptanceDate: '', liquidationStatus: 'NO', liquidationDate: '',
    overallStatus: 'ACTIVE', hasWarranty: 'NO', warrantyMonths: 0, warrantyStartDate: '',
    attachments: []
  });

  useEffect(() => {
    if (editingContract) setFormData(editingContract);
    else setFormData({
      id: `HĐ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: '', customer: '', representative: '', sideB: 'Công ty TNHH Đầu tư Sản xuất Linh Hân',
      type: 'CUNG_CAP', value: 0, signDate: format(new Date(), 'yyyy-MM-dd'),
      startDate: format(new Date(), 'yyyy-MM-dd'), endDate: '', note: '',
      performanceGuaranteeAmount: 0, performanceGuaranteeIssueDate: '', performanceGuaranteeExpiryDate: '', performanceGuaranteeStatus: 'PENDING',
      bidGuaranteeAmount: 0, bidGuaranteeStatus: 'DONE', bidGuaranteeRefundDate: '',
      paidAmount: 0, isOverdueDebt: false, overdueAmount: 0, overdueDate: '',
      acceptanceStatus: 'NO', acceptanceDate: '', liquidationStatus: 'NO', liquidationDate: '',
      overallStatus: 'ACTIVE', hasWarranty: 'NO', warrantyMonths: 0, warrantyStartDate: '',
      attachments: []
    });
  }, [editingContract, isOpen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newFile: FileAttachment = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            size: file.size,
            base64: reader.result as string,
            uploadDate: format(new Date(), 'yyyy-MM-dd HH:mm')
          };
          setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), newFile] }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAttachment = (fileId: string) => {
    setFormData(prev => ({ ...prev, attachments: prev.attachments?.filter(f => f.id !== fileId) }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
          <h3 className="text-xl font-bold flex items-center gap-2">
            {editingContract ? <FileEdit className="text-blue-400" /> : <Plus className="text-emerald-400" />}
            {editingContract ? 'Chỉnh sửa hợp đồng' : 'Thêm hợp đồng mới'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <form className="p-8 overflow-y-auto flex-1" onSubmit={(e) => { e.preventDefault(); onSubmit(formData as Contract); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-4">
                <FileText size={16} className="text-blue-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Thông tin cơ bản</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Số hợp đồng" value={formData.id} onChange={(v: string) => setFormData({...formData, id: v})} required disabled={!!editingContract} />
                <InputField label="Ngày ký" type="date" value={formData.signDate} onChange={(v: string) => setFormData({...formData, signDate: v})} required />
              </div>
              <InputField label="Tên hợp đồng / Dự án" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} required />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Chủ đầu tư" value={formData.customer} onChange={(v: string) => setFormData({...formData, customer: v})} required />
                <InputField label="Người đại diện" value={formData.representative} onChange={(v: string) => setFormData({...formData, representative: v})} />
              </div>
              <InputField label="Bên thực hiện (Bên B)" value={formData.sideB} onChange={(v: string) => setFormData({...formData, sideB: v})} />
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Loại hợp đồng" value={formData.type} onChange={(v: any) => setFormData({...formData, type: v})} options={['Thi công', 'Tư vấn', 'Cung cấp', 'Dịch vụ', 'Khác']} values={['THI_CONG', 'TU_VAN', 'CUNG_CAP', 'DICH_VU', 'KHAC']} />
                <InputField label="Giá trị hợp đồng (VNĐ)" type="number" value={formData.value} onChange={(v: any) => setFormData({...formData, value: Number(v)})} required icon={Tag} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Ngày bắt đầu" type="date" value={formData.startDate} onChange={(v: string) => setFormData({...formData, startDate: v})} />
                <InputField label="Ngày kết thúc dự kiến" type="date" value={formData.endDate} onChange={(v: string) => setFormData({...formData, endDate: v})} />
              </div>

              <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mt-10 mb-4">
                <ShieldCheck size={16} className="text-emerald-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Bảo lãnh & Tài chính</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Bảo lãnh thực hiện (VNĐ)" type="number" value={formData.performanceGuaranteeAmount} onChange={(v: any) => setFormData({...formData, performanceGuaranteeAmount: Number(v)})} />
                <SelectField label="Trạng thái bảo lãnh" value={formData.performanceGuaranteeStatus} onChange={(v: any) => setFormData({...formData, performanceGuaranteeStatus: v})} options={['Chưa tất toán', 'Đã tất toán']} values={['PENDING', 'DONE']} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Bảo lãnh dự thầu (VNĐ)" type="number" value={formData.bidGuaranteeAmount} onChange={(v: any) => setFormData({...formData, bidGuaranteeAmount: Number(v)})} />
                <SelectField label="Trạng thái thu hồi" value={formData.bidGuaranteeStatus} onChange={(v: any) => setFormData({...formData, bidGuaranteeStatus: v})} options={['Chưa thu hồi', 'Đã thu hồi']} values={['PENDING', 'DONE']} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Đã thanh toán (VNĐ)" type="number" value={formData.paidAmount} onChange={(v: any) => setFormData({...formData, paidAmount: Number(v)})} />
                <div className="flex flex-col gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.isOverdueDebt} onChange={e => setFormData({...formData, isOverdueDebt: e.target.checked})} className="w-4 h-4 rounded bg-slate-800 border-slate-700" />
                    <span className="text-xs font-bold text-slate-400 uppercase">Nợ quá hạn?</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mb-4">
                <History size={16} className="text-purple-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Tiến độ & Nghiệm thu</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Nghiệm thu" value={formData.acceptanceStatus} onChange={(v: any) => setFormData({...formData, acceptanceStatus: v})} options={['Chưa có', 'Đã có']} values={['NO', 'YES']} />
                <InputField label="Ngày nghiệm thu" type="date" value={formData.acceptanceDate} onChange={(v: string) => setFormData({...formData, acceptanceDate: v})} disabled={formData.acceptanceStatus === 'NO'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Thanh lý" value={formData.liquidationStatus} onChange={(v: any) => setFormData({...formData, liquidationStatus: v})} options={['Chưa có', 'Đã có']} values={['NO', 'YES']} />
                <InputField label="Ngày thanh lý" type="date" value={formData.liquidationDate} onChange={(v: string) => setFormData({...formData, liquidationDate: v})} disabled={formData.liquidationStatus === 'NO'} />
              </div>
              <SelectField label="Trạng thái tổng thể" value={formData.overallStatus} onChange={(v: any) => setFormData({...formData, overallStatus: v})} options={['Đang thực hiện', 'Hoàn thành', 'Tạm dừng', 'Thanh lý', 'Hủy']} values={['ACTIVE', 'COMPLETED', 'PAUSED', 'LIQUIDATED', 'CANCELLED']} />

              <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mt-10 mb-4">
                <ShieldCheck size={16} className="text-amber-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Bảo hành</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Làm bảo hành" value={formData.hasWarranty} onChange={(v: any) => setFormData({...formData, hasWarranty: v})} options={['Chưa làm', 'Đã làm']} values={['NO', 'YES']} />
                <InputField label="Số tháng bảo hành" type="number" value={formData.warrantyMonths} onChange={(v: any) => setFormData({...formData, warrantyMonths: Number(v)})} disabled={formData.hasWarranty === 'NO'} />
              </div>
              <InputField label="Ngày bắt đầu bảo hành" type="date" value={formData.warrantyStartDate} onChange={(v: string) => setFormData({...formData, warrantyStartDate: v})} disabled={formData.hasWarranty === 'NO'} />

              <div className="flex items-center gap-2 pb-2 border-b border-slate-800 mt-10 mb-4">
                <Download size={16} className="text-slate-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Tệp đính kèm</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex-1 cursor-pointer bg-slate-800 border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-slate-800/50 rounded-2xl p-6 transition-all group flex flex-col items-center gap-2">
                    <Plus className="text-slate-600 group-hover:text-blue-400" size={24} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-400">Chọn tệp upload (PDF, Hình ảnh, Excel...)</span>
                    <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {formData.attachments?.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl group">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 rounded-lg text-blue-400">
                          <FileText size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-200 line-clamp-1">{file.name}</span>
                          <span className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB • {file.uploadDate}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeAttachment(file.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-10">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ghi chú nội bộ</label>
                <textarea 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px] resize-none"
                  placeholder="Nhập ghi chú thêm cho hợp đồng..."
                  value={formData.note}
                  onChange={e => setFormData({...formData, note: e.target.value})}
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-700 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-all">Hủy bỏ</button>
                <button type="submit" className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/40 transition-all">Lưu hợp đồng</button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ContractDetailModal = ({ isOpen, onClose, contract }: { isOpen: boolean, onClose: () => void, contract: Contract | null }) => {
  if (!isOpen || !contract) return null;

  const debt = contract.value - contract.paidAmount;
  const isWarrantyExpiringSoon = () => {
    if (contract.hasWarranty === 'NO' || !contract.warrantyStartDate) return false;
    const start = new Date(contract.warrantyStartDate);
    const end = new Date(start.setMonth(start.getMonth() + (contract.warrantyMonths || 0)));
    const diff = end.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
               <FileText size={28} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-white tracking-tight">{contract.name}</h2>
              <span className="text-xs font-mono font-extrabold text-blue-400 tracking-widest uppercase">Số hồ sơ: {contract.id}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-full transition-colors text-slate-500"><X size={24} /></button>
        </div>

        <div className="p-10 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
             <div className="bg-slate-800/30 p-5 rounded-3xl border border-slate-700/30">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2">Giá trị dự án</span>
                <div className="text-xl font-extrabold text-white">{contract.value.toLocaleString()} đ</div>
             </div>
             <div className="bg-slate-800/30 p-5 rounded-3xl border border-slate-700/30">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2">Đã thanh toán</span>
                <div className="text-xl font-extrabold text-emerald-400">{contract.paidAmount.toLocaleString()} đ</div>
             </div>
             <div className="bg-slate-800/30 p-5 rounded-3xl border border-slate-700/30">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2">Còn nợ lại</span>
                <div className={`text-xl font-extrabold ${debt > 0 ? 'text-red-400' : 'text-slate-400'}`}>{debt.toLocaleString()} đ</div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
               <DetailSection title="Thông tin pháp lý">
                  <DetailItem label="Chủ đầu tư" value={contract.customer} />
                  <DetailItem label="Đại diện đối tác" value={contract.representative || '---'} />
                  <DetailItem label="Bên thực hiện (B)" value={contract.sideB} />
                  <DetailItem label="Loại hình" value={contract.type} />
                  <DetailItem label="Trạng thái hợp đồng" value={contract.overallStatus} isBadge />
               </DetailSection>

               <DetailSection title="Tiến độ thực hiện">
                  <DetailItem label="Ngày ký kết" value={contract.signDate} />
                  <DetailItem label="Ngày bắt đầu" value={contract.startDate} />
                  <DetailItem label="Ngày kết thúc dự kiến" value={contract.endDate} />
                  <DetailItem label="Nghiệm thu" value={contract.acceptanceStatus === 'YES' ? `Đã nghiệm thu (${contract.acceptanceDate})` : 'Chưa nghiệm thu'} />
                  <DetailItem label="Thanh lý" value={contract.liquidationStatus === 'YES' ? `Đã thanh lý (${contract.liquidationDate})` : 'Chưa thanh lý'} />
               </DetailSection>
            </div>

            <div className="space-y-8">
               <DetailSection title="Bảo lãnh & Bảo hành">
                  <DetailItem label="Bảo lãnh thực hiện" value={`${contract.performanceGuaranteeAmount?.toLocaleString()} đ (${contract.performanceGuaranteeStatus === 'DONE' ? 'Đã tất toán' : 'Chưa tất toán'})`} />
                  <DetailItem label="Bảo lãnh dự thầu" value={`${contract.bidGuaranteeAmount?.toLocaleString()} đ (${contract.bidGuaranteeStatus === 'DONE' ? 'Đã thu hồi' : 'Chưa thu hồi'})`} />
                  <DetailItem label="Chế độ bảo hành" value={contract.hasWarranty === 'YES' ? `${contract.warrantyMonths} tháng (Từ ${contract.warrantyStartDate})` : 'Không bảo hành'} />
                  {isWarrantyExpiringSoon() && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-bold uppercase flex items-center gap-2">
                       <AlertCircle size={14} /> Cảnh báo: Sắp hết hạn bảo hành!
                    </div>
                  )}
               </DetailSection>

               <DetailSection title="Tệp đính kèm tài liệu">
                  {contract.attachments.length === 0 ? (
                    <span className="text-xs text-slate-600 italic">Không có tài liệu đính kèm</span>
                  ) : (
                    <div className="space-y-2">
                      {contract.attachments.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-2xl border border-slate-700/30 group">
                           <div className="flex items-center gap-3">
                              <FileText size={16} className="text-slate-500" />
                              <div className="flex flex-col">
                                 <span className="text-xs font-bold text-slate-300 line-clamp-1">{file.name}</span>
                                 <span className="text-[10px] text-slate-600">{(file.size/1024).toFixed(1)}KB • {file.uploadDate}</span>
                              </div>
                           </div>
                           <a href={file.base64} download={file.name} className="p-2 bg-slate-900 rounded-xl text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Download size={14} />
                           </a>
                        </div>
                      ))}
                    </div>
                  )}
               </DetailSection>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-slate-800/20 rounded-3xl border border-slate-800">
             <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block mb-2">Ghi chú nội bộ</span>
             <p className="text-sm text-slate-400 italic leading-relaxed">{contract.note || 'Không có ghi chú nào cho hợp đồng này.'}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const DetailSection = ({ title, children }: any) => (
  <div className="space-y-4">
    <h4 className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800 pb-2">{title}</h4>
    <div className="space-y-3">{children}</div>
  </div>
);

const DetailItem = ({ label, value, isBadge }: any) => (
  <div className="flex justify-between items-start">
    <span className="text-xs text-slate-500">{label}</span>
    {isBadge ? (
       <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-[9px] font-extrabold uppercase">{value}</span>
    ) : (
       <span className="text-xs font-bold text-slate-200 text-right">{value}</span>
    )}
  </div>
);

const ContractView = ({ contracts, onAdd, onEdit, onDelete, onViewDetail }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterQuick, setFilterQuick] = useState('');

  const stats = {
    total: contracts.length,
    totalValue: contracts.reduce((acc, c) => acc + c.value, 0),
    totalPaid: contracts.reduce((acc, c) => acc + c.paidAmount, 0),
    totalDebt: contracts.reduce((acc, c) => acc + (c.value - c.paidAmount), 0),
    active: contracts.filter(c => c.overallStatus === 'ACTIVE').length,
    warrantyExpiring: contracts.filter(c => {
       if (c.hasWarranty === 'NO' || !c.warrantyStartDate) return false;
       const start = new Date(c.warrantyStartDate);
       const end = new Date(start.setMonth(start.getMonth() + (c.warrantyMonths || 0)));
       const diff = end.getTime() - new Date().getTime();
       return diff >= 0 && diff <= (30 * 24 * 60 * 60 * 1000);
    }).length
  };

  const filteredContracts = contracts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase()) || c.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || c.type === filterType;
    const matchesStatus = !filterStatus || c.overallStatus === filterStatus;
    
    let matchesQuick = true;
    if (filterQuick === 'OVERDUE') matchesQuick = c.isOverdueDebt;
    if (filterQuick === 'BID_PENDING') matchesQuick = c.bidGuaranteeStatus === 'PENDING';
    
    return matchesSearch && matchesType && matchesStatus && matchesQuick;
  });

  const exportCSV = () => {
    const headers = ['Số HĐ', 'Tên hợp đồng', 'Chủ đầu tư', 'Ngày ký', 'Giá trị', 'Đã thanh toán', 'Trạng thái'];
    const rows = filteredContracts.map(c => [c.id, `"${c.name}"`, `"${c.customer}"`, c.signDate, c.value, c.paidAmount, c.overallStatus]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_hop_dong_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Hợp Đồng & Dự Án</h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý vòng đời hợp đồng, tài chính và bảo hành</p>
        </div>
        <div className="flex gap-4">
          <button onClick={exportCSV} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all">
            <Download size={18} /> Xuất CSV
          </button>
          <button onClick={onAdd} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-900/40 transition-all">
            <Plus size={20} /> Thêm hợp đồng
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <StatCard label="Tổng hợp đồng" value={stats.total} icon={Layers} color="blue" />
        <StatCard label="Giá trị (Tỉ VNĐ)" value={(stats.totalValue / 1000000000).toFixed(1)} icon={Tag} color="purple" />
        <StatCard label="Đã thu (Tỉ VNĐ)" value={(stats.totalPaid / 1000000000).toFixed(1)} icon={CheckCircle} color="emerald" />
        <StatCard label="Còn nợ (Tỉ VNĐ)" value={(stats.totalDebt / 1000000000).toFixed(1)} icon={AlertCircle} color="red" />
        <StatCard label="Đang thực hiện" value={stats.active} icon={Clock3} color="orange" />
        <StatCard label="Sắp hết BH" value={stats.warrantyExpiring} icon={ShieldCheck} color="amber" />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
         <div className="relative flex-1">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input type="text" placeholder="Tìm theo số HĐ, tên DA, đối tác..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
         </div>
         <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full md:w-auto">
            <select className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-6 text-sm outline-none" value={filterType} onChange={e => setFilterType(e.target.value)}>
               <option value="">Loại HĐ</option>
               <option value="THI_CONG">Thi công</option>
               <option value="TU_VAN">Tư vấn</option>
               <option value="CUNG_CAP">Cung cấp</option>
               <option value="DICH_VU">Dịch vụ</option>
               <option value="KHAC">Khác</option>
            </select>
            <select className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-6 text-sm outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
               <option value="">Trạng thái</option>
               <option value="ACTIVE">Đang thực hiện</option>
               <option value="COMPLETED">Hoàn thành</option>
               <option value="PAUSED">Tạm dừng</option>
               <option value="LIQUIDATED">Thanh lý</option>
               <option value="CANCELLED">Hủy</option>
            </select>
            <select className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-6 text-sm outline-none col-span-2 md:col-span-1" value={filterQuick} onChange={e => setFilterQuick(e.target.value)}>
               <option value="">Lọc nhanh</option>
               <option value="OVERDUE">Nợ quá hạn</option>
               <option value="BID_PENDING">Bảo lãnh chưa thu hồi</option>
            </select>
         </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800/40 text-slate-500 uppercase text-[10px] font-bold tracking-[0.2em] px-8">
              <tr>
                <th className="px-8 py-6">Mã & Hợp đồng</th>
                <th className="px-8 py-6">Chủ đầu tư</th>
                <th className="px-8 py-6 text-right">Giá trị (VNĐ)</th>
                <th className="px-8 py-6 text-right">Đã thanh toán</th>
                <th className="px-8 py-6 text-right">Còn nợ lại</th>
                <th className="px-8 py-6 text-center">Trạng thái</th>
                <th className="px-8 py-6 text-center">Bảo hành</th>
                <th className="px-8 py-6 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredContracts.map(c => {
                const debt = c.value - c.paidAmount;
                const getOverallStatusLabel = (s: string) => {
                  if (s === 'ACTIVE') return { label: 'Đang thực hiện', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
                  if (s === 'COMPLETED') return { label: 'Hoàn thành', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
                  if (s === 'LIQUIDATED') return { label: 'Thanh lý', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
                  if (s === 'PAUSED') return { label: 'Tạm dừng', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
                  if (s === 'CANCELLED') return { label: 'Đã hủy', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
                  return { label: s, color: 'text-slate-500 bg-slate-800' };
                };
                const statusInfo = getOverallStatusLabel(c.overallStatus);

                return (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col max-w-[250px]">
                        <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">{c.name}</span>
                        <span className="text-[10px] font-mono font-extrabold text-blue-500 tracking-widest mt-1">NO: {c.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col">
                         <span className="text-xs font-bold text-slate-300">{c.customer}</span>
                         <span className="text-[10px] text-slate-500 font-bold mt-1">Ký: {c.signDate}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right font-mono font-bold text-slate-200">{c.value.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right font-mono font-bold text-emerald-400">{c.paidAmount.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex flex-col items-end">
                          <span className={`font-mono font-bold ${debt > 0 ? 'text-red-400' : 'text-slate-500'}`}>{debt.toLocaleString()}</span>
                          {c.isOverdueDebt && <span className="text-[8px] font-extrabold text-white bg-red-600 px-1.5 py-0.5 rounded uppercase tracking-tighter mt-1">Quá hạn</span>}
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-tight border ${statusInfo.color}`}>
                          {statusInfo.label}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="flex justify-center">
                          {c.hasWarranty === 'YES' ? <CheckCircle size={16} className="text-emerald-400" /> : <Clock size={16} className="text-slate-700" />}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => onViewDetail(c)} className="p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl shadow-lg transition-all"><Eye size={16} /></button>
                        <button onClick={() => onEdit(c)} className="p-2 bg-slate-800 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl shadow-lg transition-all"><Edit size={16} /></button>
                        <button onClick={() => onDelete(c.id)} className="p-2 bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl shadow-lg transition-all"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const HRView = ({ employees, onAdd, onEdit, onDelete, onViewDetail, onUpdateAttendance }: any) => {
  const [activeTab, setActiveTab] = useState('LIST'); // DASHBOARD, LIST, ATTENDANCE, PROJECTS
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterPos, setFilterPos] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [attendanceMonth, setAttendanceMonth] = useState(format(new Date(), 'MM/yyyy'));

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'Đang làm').length,
    probation: employees.filter(e => e.status === 'Thử việc').length,
    resigned: employees.filter(e => e.status === 'Nghỉ việc').length,
    contractExpiring: employees.filter(e => {
      const diff = new Date(e.contractExpiryDate).getTime() - new Date().getTime();
      return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
    }).length,
    totalProjects: employees.reduce((acc, e) => acc + e.projects.length, 0),
    totalWinValue: employees.reduce((acc, e) => acc + e.projects.reduce((sum, p) => sum + p.value, 0), 0)
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.id.toLowerCase().includes(searchTerm.toLowerCase()) || e.phone.includes(searchTerm);
    const matchesDept = !filterDept || e.department === filterDept;
    const matchesPos = !filterPos || e.position === filterPos;
    const matchesStatus = !filterStatus || e.status === filterStatus;
    return matchesSearch && matchesDept && matchesPos && matchesStatus;
  });

  const exportEmployeesCSV = () => {
    const headers = ['Mã NV', 'Họ tên', 'Phòng ban', 'Chức vụ', 'Số điện thoại', 'Email', 'Trạng thái', 'Ngày vào'];
    const rows = filteredEmployees.map(e => [e.id, `"${e.name}"`, e.department, e.position, e.phone, e.email, e.status, e.startDate]);
    const csvContent = "\uFEFF" + [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `danh_sach_nhan_vien_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.click();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Hồ Sơ Nhân Sự</h2>
          <p className="text-slate-500 text-sm mt-1">Quản lý vòng đời nhân sự, chấm công và hiệu quả công việc</p>
          
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl mt-6 w-fit">
            {[
              { id: 'DASHBOARD', label: 'Tổng quan', icon: Grid },
              { id: 'LIST', label: 'Danh bản', icon: ListIcon },
              { id: 'ATTENDANCE', label: 'Chấm công', icon: Calendar },
              { id: 'PROJECTS', label: 'Gói thầu', icon: Briefcase },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={exportEmployeesCSV} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center gap-2 transition-all">
            <Download size={18} /> Xuất dữ liệu
          </button>
          <button onClick={onAdd} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 px-8 rounded-2xl flex items-center gap-2 shadow-xl shadow-green-900/40 transition-all">
            <UserPlus size={18} /> Thêm nhân viên
          </button>
        </div>
      </div>

      {activeTab === 'DASHBOARD' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatCard label="Tổng nhân viên" value={stats.total} icon={Users} color="blue" />
            <StatCard label="Đang làm việc" value={stats.active} icon={CheckCircle} color="emerald" />
            <StatCard label="Đang thử việc" value={stats.probation} icon={Clock3} color="orange" />
            <StatCard label="Đã nghỉ việc" value={stats.resigned} icon={AlertCircle} color="slate" />
            <StatCard label="HĐ sắp hết hạn" value={stats.contractExpiring} icon={History} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
               <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest"><History size={16} /> Cảnh báo hợp đồng sắp hết hạn (30 ngày)</h3>
               <div className="space-y-4">
                  {employees.filter(e => {
                    const diff = new Date(e.contractExpiryDate).getTime() - new Date().getTime();
                    return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
                  }).length > 0 ? (
                    employees.filter(e => {
                      const diff = new Date(e.contractExpiryDate).getTime() - new Date().getTime();
                      return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
                    }).map(e => {
                      const diff = Math.ceil((new Date(e.contractExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      const severity = diff <= 15 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400';
                      return (
                        <div key={e.id} className={`flex items-center justify-between p-5 rounded-3xl border ${severity}`}>
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border-2 border-current/20">
                                 {e.avatar ? <img src={e.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold">{e.name.charAt(0)}</div>}
                              </div>
                              <div>
                                 <div className="font-bold">{e.name}</div>
                                 <div className="text-[10px] font-bold uppercase opacity-70">{e.department} • {e.position}</div>
                              </div>
                           </div>
                           <div className="text-right">
                              <div className="text-xs font-bold truncate">Hết hạn: {format(new Date(e.contractExpiryDate), 'dd/MM/yyyy')}</div>
                              <div className="text-[10px] font-bold uppercase mt-1">Còn lại: {diff} ngày</div>
                           </div>
                        </div>
                      )
                    })
                  ) : <div className="text-slate-500 text-sm py-10 text-center">Không có hợp đồng nào sắp hết hạn.</div>}
               </div>
            </div>
            <div className="space-y-8">
               <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl h-fit">
                  <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2 uppercase tracking-widest"><AlertCircle size={16} /> Chỉ số tiêu cực tháng: {format(new Date(), 'MM/yyyy')}</h3>
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Số lần đi trễ tổng:</span>
                        <span className="text-xs font-bold text-red-500">
                          {employees.reduce((acc, e) => {
                            const record = e.attendance.find(a => a.monthYear === format(new Date(), 'MM/yyyy'));
                            return acc + (record?.lateTimes || 0);
                          }, 0)} lần
                        </span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Số giờ tăng ca tổng:</span>
                        <span className="text-xs font-bold text-emerald-500">
                          {employees.reduce((acc, e) => {
                            const record = e.attendance.find(a => a.monthYear === format(new Date(), 'MM/yyyy'));
                            return acc + (record?.overtimeRegular || 0) + (record?.overtimeHoliday || 0) + (record?.overtimeWeekend || 0);
                          }, 0)} giờ
                        </span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Dự án đang phụ trách:</span>
                        <span className="text-xs font-bold text-blue-500">{stats.totalProjects} gói</span>
                     </div>
                     <div className="pt-4 border-t border-slate-800 mt-4">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block mb-4">Nhân viên đi trễ nhiều nhất</span>
                        {employees.map(e => {
                          const record = e.attendance.find(a => a.monthYear === format(new Date(), 'MM/yyyy'));
                          return { name: e.name, lateTimes: record?.lateTimes || 0 };
                        }).sort((a, b) => b.lateTimes - a.lateTimes).slice(0, 3).map((item, idx) => (
                           <div key={idx} className="flex items-center justify-between mb-3 last:mb-0">
                              <span className="text-[11px] font-medium text-slate-300">{item.name}</span>
                              <span className="text-[11px] font-bold text-red-400">{item.lateTimes} lần</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'LIST' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="relative col-span-1 md:col-span-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="text" placeholder="Tìm theo mã NV, tên..." className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
             </div>
             <select className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-6 text-sm outline-none" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                <option value="">Tất cả phòng ban</option>
                <option value="KY_THUAT">Kỹ thuật</option>
                <option value="KINH_DOANH">Kinh doanh</option>
                <option value="KE_TOAN">Kế toán</option>
                <option value="HANH_CHINH">Hành chính</option>
                <option value="BAN_GIAM_DOC">Ban giám đốc</option>
                <option value="KHAC">Khác</option>
             </select>
             <select className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-6 text-sm outline-none" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Tất cả trạng thái</option>
                <option value="Đang làm">Đang làm</option>
                <option value="Nghỉ phép">Nghỉ phép</option>
                <option value="Nghỉ việc">Nghỉ việc</option>
                <option value="Thử việc">Thử việc</option>
             </select>
             <select className="bg-slate-900 border border-slate-800 rounded-2xl py-3 px-6 text-sm outline-none" value={filterPos} onChange={e => setFilterPos(e.target.value)}>
                <option value="">Tất cả chức vụ</option>
                <option value="Nhân viên">Nhân viên</option>
                <option value="Trưởng nhóm">Trưởng nhóm</option>
                <option value="Trưởng phòng">Trưởng phòng</option>
                <option value="Phó giám đốc">Phó giám đốc</option>
                <option value="Giám đốc">Giám đốc</option>
                <option value="Khác">Khác</option>
             </select>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-800/40 text-slate-500 uppercase text-[10px] font-bold tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6">Nhân viên</th>
                    <th className="px-8 py-6">Phòng ban</th>
                    <th className="px-8 py-6">Chức vụ</th>
                    <th className="px-8 py-6">Liên hệ</th>
                    <th className="px-8 py-6 text-center">Loại HĐ</th>
                    <th className="px-8 py-6 text-center">Hết hạn HĐ</th>
                    <th className="px-8 py-6 text-center">Trạng thái</th>
                    <th className="px-8 py-6 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredEmployees.map(e => {
                    const diff = new Date(e.contractExpiryDate).getTime() - new Date().getTime();
                    const isExpiringSoon = diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
                    return (
                      <tr key={e.id} className="hover:bg-slate-800/30 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400 overflow-hidden">
                               {e.avatar ? <img src={e.avatar} className="w-full h-full object-cover" /> : e.name.split(' ').pop()?.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                               <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors uppercase">{e.name}</span>
                               <span className="text-[10px] font-mono font-extrabold text-slate-500 tracking-widest mt-1">NO: {e.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-xs text-slate-300">{e.department}</td>
                        <td className="px-8 py-6 text-xs text-slate-300 font-medium">{e.position}</td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col gap-1">
                              <span className="text-xs text-slate-300 flex items-center gap-1.5"><Phone size={10} className="text-slate-500" /> {e.phone}</span>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1.5"><Mail size={10} className="text-slate-500" /> {e.email}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center text-xs font-bold text-slate-400">{e.contractType}</td>
                        <td className="px-8 py-6 text-center">
                           <div className="flex flex-col items-center">
                              <span className={`text-xs font-bold ${isExpiringSoon ? 'text-amber-500 underline decoration-2 underline-offset-4' : 'text-slate-300'}`}>{format(new Date(e.contractExpiryDate), 'dd/MM/yyyy')}</span>
                              {isExpiringSoon && <span className="text-[8px] font-extrabold text-amber-500 uppercase mt-1">Sắp hết hạn</span>}
                           </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-tight border ${
                             e.status === 'Đang làm' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                             e.status === 'Thử việc' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                             e.status === 'Nghỉ phép' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                             'text-slate-400 bg-slate-800 border-slate-700'
                           }`}>
                              {e.status}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => onViewDetail(e)} className="p-2.5 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"><Eye size={16} /></button>
                            <button onClick={() => onEdit(e)} className="p-2.5 bg-slate-800 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all"><Edit size={16} /></button>
                            <button onClick={() => onDelete(e.id)} className="p-2.5 bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ATTENDANCE' && (
        <AttendanceReportView employees={employees} monthYear={attendanceMonth} onMonthChange={setAttendanceMonth} onUpdate={onUpdateAttendance} />
      )}

      {activeTab === 'PROJECTS' && (
        <ProjectExperienceView employees={employees} />
      )}
    </div>
  );
};

const AttendanceReportView = ({ employees, monthYear, onMonthChange, onUpdate }: any) => {
  const exportAttendanceCSV = () => {
    const headers = ['Mã NV', 'Họ tên', 'Phòng ban', 'Ngày công chuẩn', 'Đi làm thực tế', 'Nghỉ phép', 'Nghỉ không phép', 'Đi trễ (lần)', 'Tăng ca (giờ)'];
    const rows = employees.map(e => {
      const r = e.attendance.find(a => a.monthYear === monthYear);
      return [e.id, e.name, e.department, r?.standardDays || 0, r?.actualDays || 0, r?.leaveWithReason || 0, r?.leaveWithoutReason || 0, r?.lateTimes || 0, (r?.overtimeRegular || 0) + (r?.overtimeHoliday || 0)];
    });
    const csvContent = "\uFEFF" + [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cham_cong_${monthYear.replace('/', '_')}.csv`);
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Kỳ báo cáo</span>
           <input 
             type="text" 
             placeholder="MM/yyyy" 
             className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm outline-none w-32 font-bold text-blue-400" 
             value={monthYear}
             onChange={e => onMonthChange(e.target.value)}
           />
        </div>
        <button onClick={exportAttendanceCSV} className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2">
           <Download size={14} /> Xuất bảng công
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] whitespace-nowrap">
            <thead className="bg-slate-800/40 text-slate-500 uppercase font-bold tracking-tight">
              <tr>
                <th className="px-6 py-5">Nhân sự</th>
                <th className="px-4 py-5 text-center">Công chuẩn</th>
                <th className="px-4 py-5 text-center">Đi làm</th>
                <th className="px-4 py-5 text-center">Nghỉ phép</th>
                <th className="px-4 py-5 text-center">Nghỉ k.phép</th>
                <th className="px-4 py-5 text-center">Đi trễ (lần)</th>
                <th className="px-4 py-5 text-center">Tăng ca (H)</th>
                <th className="px-4 py-5">Ghi chú</th>
                <th className="px-6 py-5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {employees.map(e => {
                const record = e.attendance.find(a => a.monthYear === monthYear) || { monthYear, standardDays: 22, actualDays: 0, leaveWithReason: 0, leaveWithoutReason: 0, annualLeaveUsed: 0, lateTimes: 0, lateMinutes: 0, overtimeRegular: 0, overtimeHoliday: 0, overtimeWeekend: 0, monthlyNote: '' };
                const isOverLimit = (record.leaveWithoutReason > 0) || (record.lateTimes > 3);

                return (
                  <tr key={e.id} className={`hover:bg-slate-800/30 transition-all ${isOverLimit ? 'bg-red-500/5' : ''}`}>
                    <td className="px-6 py-5">
                       <div className="flex flex-col">
                          <span className="font-bold text-slate-200">{e.name}</span>
                          <span className="text-[9px] text-slate-500 uppercase">{e.id} • {e.department}</span>
                       </div>
                    </td>
                    <td className="px-4 py-5 text-center"><input type="number" className="w-12 bg-transparent text-center outline-none border-b border-slate-700/50 focus:border-blue-500" value={record.standardDays} onChange={ev => onUpdate(e.id, {...record, standardDays: Number(ev.target.value)})} /></td>
                    <td className="px-4 py-5 text-center font-bold"><input type="number" className="w-12 bg-transparent text-center outline-none border-b border-slate-700/50 focus:border-blue-500 text-emerald-400" value={record.actualDays} onChange={ev => onUpdate(e.id, {...record, actualDays: Number(ev.target.value)})} /></td>
                    <td className="px-4 py-5 text-center"><input type="number" className="w-12 bg-transparent text-center outline-none border-b border-slate-700/50 focus:border-blue-500" value={record.leaveWithReason} onChange={ev => onUpdate(e.id, {...record, leaveWithReason: Number(ev.target.value)})} /></td>
                    <td className="px-4 py-5 text-center"><input type="number" className="w-12 bg-transparent text-center outline-none border-b border-slate-700/50 focus:border-red-500 text-red-400" value={record.leaveWithoutReason} onChange={ev => onUpdate(e.id, {...record, leaveWithoutReason: Number(ev.target.value)})} /></td>
                    <td className="px-4 py-5 text-center"><input type="number" className="w-12 bg-transparent text-center outline-none border-b border-slate-700/50 focus:border-amber-500" value={record.lateTimes} onChange={ev => onUpdate(e.id, {...record, lateTimes: Number(ev.target.value)})} /></td>
                    <td className="px-4 py-5 text-center"><input type="number" className="w-12 bg-transparent text-center outline-none border-b border-slate-700/50 focus:border-blue-500" value={record.overtimeRegular} onChange={ev => onUpdate(e.id, {...record, overtimeRegular: Number(ev.target.value)})} /></td>
                    <td className="px-4 py-5"><input type="text" className="w-full bg-transparent outline-none border-b border-slate-700/50 focus:border-blue-500 text-slate-400 text-[10px]" value={record.monthlyNote} onChange={ev => onUpdate(e.id, {...record, monthlyNote: ev.target.value})} placeholder="..." /></td>
                    <td className="px-6 py-5 text-center">
                       <button className="p-1.5 hover:bg-slate-800 rounded-lg text-emerald-500 transition-all"><CheckCircle size={14} /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProjectExperienceView = ({ employees }: any) => {
  const allProjects = employees.flatMap((e: any) => e.projects.map((p: any) => ({ ...p, employeeName: e.name, employeeId: e.id, department: e.department })));

  return (
    <div className="space-y-6">
       <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-800/40 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
                   <tr>
                      <th className="px-8 py-6">Nhân sự tham gia</th>
                      <th className="px-8 py-6">Phòng ban</th>
                      <th className="px-8 py-6">Gói thầu / Dự án</th>
                      <th className="px-8 py-6">Vai trò</th>
                      <th className="px-8 py-6 text-right">Trị giá (VNĐ)</th>
                      <th className="px-8 py-6 text-center">Trạng thái</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                   {allProjects.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-all">
                         <td className="px-8 py-6">
                            <span className="font-bold text-slate-200">{p.employeeName}</span>
                            <span className="text-[10px] text-slate-500 block">ID: {p.employeeId}</span>
                         </td>
                         <td className="px-8 py-6 text-xs text-slate-400">{p.department}</td>
                         <td className="px-8 py-6">
                            <div className="flex flex-col">
                               <span className="font-bold text-blue-400 text-xs">{p.name}</span>
                               <span className="text-[10px] text-slate-500 tracking-tighter uppercase font-mono">CODE: {p.bidId}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                               p.role === 'CHỦ TRÌ' ? 'bg-purple-500/10 text-purple-400' :
                               p.role === 'THAM GIA' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-500'
                            }`}>{p.role}</span>
                         </td>
                         <td className="px-8 py-6 text-right font-mono font-bold text-slate-300">{p.value.toLocaleString()}</td>
                         <td className="px-8 py-6 text-center">
                            <span className={`text-[10px] font-bold uppercase ${
                               p.status === 'ACTIVE' ? 'text-emerald-400' : p.status === 'COMPLETED' ? 'text-slate-400' : 'text-red-400'
                            }`}>{p.status}</span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  )
}

const EmployeeModal = ({ isOpen, onClose, onSubmit, editingEmployee }: any) => {
  const [activeTab, setActiveTab] = useState('BASIC');
  const [formData, setFormData] = useState<Partial<Employee>>({
    id: '', name: '', gender: 'Nam', dob: '', idCard: '', phone: '', email: '', address: '',
    department: 'KHAC', position: 'NHAN_VIEN', startDate: format(new Date(), 'yyyy-MM-dd'),
    contractType: 'Thử việc', contractSignDate: format(new Date(), 'yyyy-MM-dd'), contractExpiryDate: '',
    baseSalary: 0, status: 'Thử việc', note: '', avatar: '',
    attendance: [], projects: [], attachments: []
  });

  useEffect(() => {
    if (editingEmployee) {
       setFormData(editingEmployee);
    } else {
       setFormData({
         id: `LH-NV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
         name: '', gender: 'Nam', dob: '', idCard: '', phone: '', email: '', address: '',
         department: 'KY_THUAT', position: 'NHAN_VIEN', startDate: format(new Date(), 'yyyy-MM-dd'),
         contractType: 'Thử việc', contractSignDate: format(new Date(), 'yyyy-MM-dd'), contractExpiryDate: '',
         baseSalary: 0, status: 'Thử việc', note: '', avatar: '',
         attendance: [], projects: [], attachments: []
       });
    }
    setActiveTab('BASIC');
  }, [editingEmployee, isOpen]);

  if (!isOpen) return null;

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newFile: FileAttachment = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            type: file.type,
            size: file.size,
            base64: reader.result as string,
            uploadDate: format(new Date(), 'yyyy-MM-dd HH:mm')
          };
          setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), newFile] }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-8 border-b border-slate-800 bg-slate-800/30 flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
                  <UserPlus size={24} />
               </div>
               <div>
                  <h3 className="text-xl font-bold">{editingEmployee ? 'Chỉnh sửa hồ sơ' : 'Thêm nhân viên mới'}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formData.name || 'HỒ SƠ TRỐNG'}</p>
               </div>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-xl">
               {[
                 { id: 'BASIC', label: 'Cá nhân', icon: User },
                 { id: 'CONTRACT', label: 'Hợp đồng', icon: FileText },
                 { id: 'WORK', label: 'Dự án', icon: Briefcase },
                 { id: 'FILES', label: 'Tệp đính kèm', icon: HardDrive },
               ].map(tab => (
                 <button
                   key={tab.id}
                   type="button"
                   onClick={() => setActiveTab(tab.id)}
                   className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${
                     activeTab === tab.id ? 'bg-slate-800 text-blue-400 shadow-lg' : 'text-slate-500 hover:text-slate-400'
                   }`}
                 >
                   <tab.icon size={14} /> {tab.label}
                 </button>
               ))}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500"><X size={20} /></button>
        </div>

        <form className="p-10 overflow-y-auto flex-1 flex flex-col" onSubmit={e => { e.preventDefault(); onSubmit(formData as Employee); }}>
            {activeTab === 'BASIC' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                 <div className="flex flex-col items-center gap-6">
                    <div className="w-48 h-48 rounded-[2.5rem] bg-slate-800 border-4 border-slate-800 shadow-xl overflow-hidden group relative">
                       {formData.avatar ? (
                         <img src={formData.avatar} className="w-full h-full object-cover" />
                       ) : (
                         <div className="w-full h-full flex items-center justify-center text-5xl font-black text-slate-700 uppercase">{formData.name ? formData.name.charAt(0) : '?'}</div>
                       )}
                       <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                          <Camera className="text-white mb-2" size={32} />
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Tải ảnh lên</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                       </label>
                    </div>
                    <div className="text-center">
                       <h4 className="text-sm font-bold text-white">{formData.name || '---'}</h4>
                       <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">ID: {formData.id}</span>
                    </div>
                 </div>

                 <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <InputField label="Mã nhân viên" value={formData.id} onChange={(v:any) => setFormData({...formData, id: v})} required disabled={!!editingEmployee} />
                       <InputField label="Họ và tên" value={formData.name} onChange={(v:any) => setFormData({...formData, name: v})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <SelectField label="Giới tính" value={formData.gender} onChange={(v:any) => setFormData({...formData, gender: v})} options={['Nam', 'Nữ', 'Khác']} values={['Nam', 'Nữ', 'Khác']} />
                       <InputField label="Ngày sinh" type="date" value={formData.dob} onChange={(v:any) => setFormData({...formData, dob: v})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <InputField label="Số CCCD / CMND" value={formData.idCard} onChange={(v:any) => setFormData({...formData, idCard: v})} />
                       <InputField label="Số điện thoại" value={formData.phone} onChange={(v:any) => setFormData({...formData, phone: v})} />
                    </div>
                    <InputField label="Email cá nhân / Công việc" type="email" value={formData.email} onChange={(v:any) => setFormData({...formData, email: v})} />
                    <InputField label="Địa chỉ thường trú" value={formData.address} onChange={(v:any) => setFormData({...formData, address: v})} />
                 </div>
              </div>
            )}

            {activeTab === 'CONTRACT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                 <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                       <Briefcase size={16} className="text-blue-400" />
                       <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Vị trí & Phòng ban</h4>
                    </div>
                    <SelectField label="Phòng ban" value={formData.department} onChange={(v:any) => setFormData({...formData, department: v})} options={['Kỹ thuật', 'Kinh doanh', 'Kế toán', 'Hành chính', 'Ban giám đốc', 'Khác']} values={['KY_THUAT', 'KINH_DOANH', 'KE_TOAN', 'HANH_CHINH', 'BAN_GIAM_DOC', 'KHAC']} />
                    <SelectField label="Chức vụ" value={formData.position} onChange={(v:any) => setFormData({...formData, position: v})} options={['Nhân viên', 'Trưởng nhóm', 'Trưởng phòng', 'Phó giám đốc', 'Giám đốc', 'Khác']} values={['Nhân viên', 'Trưởng nhóm', 'Trưởng phòng', 'Phó giám đốc', 'Giám đốc', 'Khác']} />
                    <InputField label="Ngày vào làm" type="date" value={formData.startDate} onChange={(v:any) => setFormData({...formData, startDate: v})} />
                    <SelectField label="Trạng thái hiện tại" value={formData.status} onChange={(v:any) => setFormData({...formData, status: v})} options={['Đang làm', 'Nghỉ phép', 'Nghỉ việc', 'Thử việc']} values={['Đang làm', 'Nghỉ phép', 'Nghỉ việc', 'Thử việc']} />
                 </div>
                 <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                       <FileText size={16} className="text-emerald-400" />
                       <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Chế độ đãi ngộ & Hợp đồng</h4>
                    </div>
                    <SelectField label="Loại hợp đồng" value={formData.contractType} onChange={(v:any) => setFormData({...formData, contractType: v})} options={['Thử việc', 'Chính thức', 'Thời vụ', 'Cộng tác viên']} values={['Thử việc', 'Chính thức', 'Thời vụ', 'Cộng tác viên']} />
                    <div className="grid grid-cols-2 gap-6">
                       <InputField label="Ngày ký HĐ" type="date" value={formData.contractSignDate} onChange={(v:any) => setFormData({...formData, contractSignDate: v})} />
                       <InputField label="Ngày hết hạn HĐ" type="date" value={formData.contractExpiryDate} onChange={(v:any) => setFormData({...formData, contractExpiryDate: v})} />
                    </div>
                    <InputField label="Mức lương cơ bản (VNĐ)" type="number" value={formData.baseSalary} onChange={(v:any) => setFormData({...formData, baseSalary: Number(v)})} />
                 </div>
              </div>
            )}

            {activeTab === 'WORK' && (
              <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Kinh nghiệm Gói thầu / Dự án tham gia</h4>
                    <button type="button" onClick={() => setFormData({...formData, projects: [...(formData.projects || []), { id: Math.random().toString(), name: '', bidId: '', client: '', value: 0, role: 'THAM GIA', winDate: '', status: 'ACTIVE' }]})} className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2 hover:bg-blue-500/10 px-3 py-1 rounded-lg">
                       <Plus size={12} /> Thêm gói thầu
                    </button>
                 </div>
                 <div className="space-y-4">
                    {formData.projects?.map((prj, idx) => (
                       <div key={prj.id} className="p-6 bg-slate-800/40 border border-slate-700/50 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-4 relative group">
                          <div className="md:col-span-2">
                             <InputField label="Tên dự án" value={prj.name} onChange={(v:any) => {
                                const newPrjs = [...(formData.projects || [])];
                                newPrjs[idx].name = v;
                                setFormData({...formData, projects: newPrjs});
                             }} />
                          </div>
                          <InputField label="Chủ đầu tư" value={prj.client} onChange={(v:any) => {
                                const newPrjs = [...(formData.projects || [])];
                                newPrjs[idx].client = v;
                                setFormData({...formData, projects: newPrjs});
                          }} />
                          <InputField label="Giá trị (VNĐ)" type="number" value={prj.value} onChange={(v:any) => {
                                const newPrjs = [...(formData.projects || [])];
                                newPrjs[idx].value = Number(v);
                                setFormData({...formData, projects: newPrjs});
                          }} />
                          <div className="flex items-center gap-4 md:col-span-4 mt-2">
                             <SelectField label="Vai trò" value={prj.role} onChange={(v:any) => {
                                const newPrjs = [...(formData.projects || [])];
                                newPrjs[idx].role = v;
                                setFormData({...formData, projects: newPrjs});
                             }} options={['Chủ trì', 'Tham gia', 'Hỗ trợ']} values={['CHỦ TRÌ', 'THAM GIA', 'HỖ TRỢ']} />
                             <InputField label="Ngày trúng thầu" type="date" value={prj.winDate} onChange={(v:any) => {
                                const newPrjs = [...(formData.projects || [])];
                                newPrjs[idx].winDate = v;
                                setFormData({...formData, projects: newPrjs});
                             }} />
                             <SelectField label="Trạng thái" value={prj.status} onChange={(v:any) => {
                                const newPrjs = [...(formData.projects || [])];
                                newPrjs[idx].status = v;
                                setFormData({...formData, projects: newPrjs});
                             }} options={['Đang thực hiện', 'Hoàn thành', 'Hủy']} values={['ACTIVE', 'COMPLETED', 'CANCELLED']} />
                          </div>
                          <button type="button" onClick={() => setFormData({...formData, projects: formData.projects?.filter(p => p.id !== prj.id)})} className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                             <X size={14} />
                          </button>
                       </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'FILES' && (
              <div className="space-y-8">
                 <div className="border-2 border-dashed border-slate-800 rounded-[2.5rem] p-12 flex flex-col items-center gap-4 group hover:border-blue-500/50 hover:bg-blue-500/5 transition-all relative">
                    <HardDrive size={48} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                    <div className="text-center">
                       <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Kéo thả hoặc click để chọn tệp hồ sơ</div>
                       <div className="text-[10px] text-slate-600 uppercase">Hợp đồng, Bằng cấp, Chứng chỉ, CCCD (PDF, JPG, PNG...)</div>
                    </div>
                    <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.attachments?.map(file => (
                       <div key={file.id} className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/30 rounded-2xl group">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400">
                                <FileText size={18} />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-200 line-clamp-1">{file.name}</span>
                                <span className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB • {file.uploadDate}</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <a href={file.base64} download={file.name} className="p-2 text-slate-500 hover:text-blue-400 transition-colors"><Download size={14} /></a>
                             <button type="button" onClick={() => setFormData({...formData, attachments: formData.attachments?.filter(f => f.id !== file.id)})} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><X size={14} /></button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            )}

            <div className="mt-auto pt-10 flex gap-4">
               <button type="button" onClick={onClose} className="flex-1 py-4 border border-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-slate-800 transition-all">Hủy bỏ</button>
               <button type="submit" className="flex-2 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all">Lưu hồ sơ nhân viên</button>
            </div>
        </form>
      </motion.div>
    </div>
  );
};

const EmployeeDetailModal = ({ isOpen, onClose, employee }: any) => {
  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md" onClick={onClose}>
       <motion.div 
         initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
         className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-black"
         onClick={e => e.stopPropagation()}
       >
          <div className="p-10 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
             <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border-2 border-blue-500/20">
                   {employee.avatar ? <img src={employee.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-800 flex items-center justify-center text-3xl font-black text-slate-600">{employee.name.charAt(0)}</div>}
                </div>
                <div>
                   <h2 className="text-3xl font-black text-white tracking-tight uppercase">{employee.name}</h2>
                   <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-mono font-extrabold text-blue-400 uppercase tracking-widest">ID: {employee.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        employee.status === 'Đang làm' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}>{employee.status}</span>
                   </div>
                </div>
             </div>
             <button onClick={onClose} className="p-4 hover:bg-slate-800 rounded-full transition-all text-slate-500"><X size={28} /></button>
          </div>

          <div className="p-10 overflow-y-auto flex-1">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-10">
                   <section>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800 pb-3 mb-5">Liên hệ & Cá nhân</h4>
                      <div className="space-y-4">
                         <DetailItem label="Giới tính" value={employee.gender} />
                         <DetailItem label="Ngày sinh" value={format(new Date(employee.dob), 'dd/MM/yyyy')} />
                         <DetailItem label="CCCD / CMND" value={employee.idCard} />
                         <DetailItem label="Số điện thoại" value={employee.phone} />
                         <DetailItem label="Email" value={employee.email} />
                         <DetailItem label="Địa chỉ" value={employee.address} />
                      </div>
                   </section>

                   <section>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800 pb-3 mb-5">Vị trí & Hợp đồng</h4>
                      <div className="space-y-4">
                         <DetailItem label="Phòng ban" value={employee.department} />
                         <DetailItem label="Chức vụ" value={employee.position} />
                         <DetailItem label="Ngày vào làm" value={format(new Date(employee.startDate), 'dd/MM/yyyy')} />
                         <DetailItem label="Mức lương CB" value={`${employee.baseSalary.toLocaleString()} đ`} />
                         <DetailItem label="Loại hợp đồng" value={employee.contractType} isBadge />
                      </div>
                   </section>
                </div>

                <div className="space-y-10">
                   <section>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800 pb-3 mb-5">Dự án / Gói thầu tham gia</h4>
                      <div className="space-y-3">
                         {employee.projects.length === 0 ? (
                           <span className="text-[10px] text-slate-600 italic">Chưa có dự án nào tham gia</span>
                         ) : employee.projects.map((p: any) => (
                           <div key={p.id} className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 flex justify-between items-center group">
                              <div>
                                 <div className="text-xs font-bold text-slate-200">{p.name}</div>
                                 <div className="text-[9px] text-slate-500 uppercase mt-0.5">{p.client} • {p.role}</div>
                              </div>
                              <span className="text-[10px] font-mono font-bold text-blue-500">{p.value.toLocaleString()} đ</span>
                           </div>
                         ))}
                      </div>
                   </section>

                   <section>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-slate-800 pb-3 mb-5">Hồ sơ đính kèm</h4>
                      <div className="grid grid-cols-1 gap-2">
                         {employee.attachments.map((f: any) => (
                           <div key={f.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-700/20 group">
                              <div className="flex items-center gap-3">
                                 <FileText size={14} className="text-slate-500" />
                                 <span className="text-[10px] font-bold text-slate-400 line-clamp-1">{f.name}</span>
                              </div>
                              <a href={f.base64} download={f.name} className="p-2 text-blue-400 hover:bg-slate-900 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                 <Download size={12} />
                              </a>
                           </div>
                         ))}
                      </div>
                   </section>
                </div>
             </div>
             
             <div className="mt-16 p-8 bg-slate-800/30 rounded-[2rem] border border-slate-800">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Ghi chú nội bộ</span>
                <p className="text-xs text-slate-400 italic leading-relaxed">{employee.note || 'Không có ghi chú nào.'}</p>
             </div>
          </div>
       </motion.div>
    </div>
  );
};

const CRMView = ({ customers }: any) => (
  <div className="space-y-8 pb-10">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <UsersRound className="text-indigo-500" /> Quản lý Khách hàng (CRM)
        </h2>
        <p className="text-slate-400 mt-1">Quản trị quan hệ và kênh bán hàng (Pipeline)</p>
      </div>
      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-500">
         Thêm Khách hàng
      </button>
    </div>

    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30">
        <h3 className="font-bold flex items-center gap-2 text-sm"><UsersRound size={16} /> DANH SÁCH KHÁCH HÀNG</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4">Mã KH</th>
              <th className="px-6 py-4">Tên khách hàng</th>
              <th className="px-6 py-4">Phân loại</th>
              <th className="px-6 py-4">Người liên hệ</th>
              <th className="px-6 py-4">Phụ trách</th>
              <th className="px-6 py-4 text-center">Lần GD gần nhất</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-6 py-4 font-mono text-blue-400 font-bold">{c.id}</td>
                <td className="px-6 py-4 font-bold">{c.name}</td>
                <td className="px-6 py-4">
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                     c.type === 'LOYAL' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'bg-slate-700 text-slate-300'
                   }`}>{c.type}</span>
                </td>
                <td className="px-6 py-4 font-medium text-slate-300">{c.contactPerson}</td>
                <td className="px-6 py-4 text-slate-400">{c.managedBy}</td>
                <td className="px-6 py-4 text-center text-slate-500 text-xs italic">Chưa có dữ liệu</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const RevenueView = (props: any) => {
    const data = [
        { name: 'Tháng 1', doanhThu: 1200, chiPhi: 800, loiNhuan: 400 },
        { name: 'Tháng 2', doanhThu: 1500, chiPhi: 950, loiNhuan: 550 },
        { name: 'Tháng 3', doanhThu: 1100, chiPhi: 750, loiNhuan: 350 },
        { name: 'Tháng 4', doanhThu: 1800, chiPhi: 1100, loiNhuan: 700 },
        { name: 'Tháng 5', doanhThu: 2100, chiPhi: 1300, loiNhuan: 800 },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <TrendingUp className="text-emerald-500" /> Báo cáo Doanh thu
                    </h2>
                    <p className="text-slate-400 mt-1">Phân tích hiệu quả kinh doanh của Công ty Linh Hân</p>
                </div>
                <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
                    <button className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold transition-all">Tháng</button>
                    <button className="px-4 py-1.5 text-slate-500 hover:text-slate-300 rounded-lg text-xs font-bold transition-all">Quý</button>
                    <button className="px-4 py-1.5 text-slate-500 hover:text-slate-300 rounded-lg text-xs font-bold transition-all">Năm</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                    <h3 className="text-lg font-bold mb-6 text-slate-300">Biểu đồ Doanh thu & Lợi nhuận (Triệu VNĐ)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                                <XAxis dataKey="name" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1a202c', borderColor: '#2d3748', color: '#fff', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend />
                                <Bar dataKey="doanhThu" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="loiNhuan" name="Lợi nhuận" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                    <h3 className="text-lg font-bold mb-6 text-slate-300">Xu hướng tăng trưởng</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                                <XAxis dataKey="name" stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#718096" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1a202c', borderColor: '#2d3748', color: '#fff', borderRadius: '12px' }}
                                />
                                <Line type="monotone" dataKey="doanhThu" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/30">
                    <h3 className="font-bold text-sm">BẢNG CHI TIẾT HIỆU QUẢ KINH DOANH</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] font-bold">
                            <tr>
                                <th className="px-6 py-4">Kỳ báo cáo</th>
                                <th className="px-6 py-4 text-right">Doanh thu</th>
                                <th className="px-6 py-4 text-right">Chi phí vốn</th>
                                <th className="px-6 py-4 text-right">Lợi nhuận</th>
                                <th className="px-6 py-4 text-center">Tỷ suất (%)</th>
                                <th className="px-6 py-4 text-center">Tăng trưởng</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {data.map((d, i) => (
                                <tr key={d.name} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4 font-bold">{d.name}</td>
                                    <td className="px-6 py-4 text-right text-blue-400 font-bold">{d.doanhThu}.000.000 đ</td>
                                    <td className="px-6 py-4 text-right text-slate-400">{d.chiPhi}.000.000 đ</td>
                                    <td className="px-6 py-4 text-right text-emerald-400 font-bold">{d.loiNhuan}.000.000 đ</td>
                                    <td className="px-6 py-4 text-center font-mono">{(d.loiNhuan / d.doanhThu * 100).toFixed(1)}%</td>
                                    <td className="px-6 py-4 text-center">
                                       <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold">
                                            <TrendingUp size={12} /> +12%
                                       </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const AlertView = ({ data }: any) => {
    const lowStock = data.products.filter(p => (p.importQuantity - p.soldQuantity) < 10);
    const overdueContracts = data.contracts.filter(c => c.isOverdueDebt);
    const expiringWarranties = data.contracts.filter(c => {
        if (c.hasWarranty === 'NO' || !c.warrantyStartDate) return false;
        const start = new Date(c.warrantyStartDate);
        const end = new Date(start.setMonth(start.getMonth() + (c.warrantyMonths || 0)));
        const diff = end.getTime() - new Date().getTime();
        return diff >= 0 && diff <= (30 * 24 * 60 * 60 * 1000);
    });
    
    return (
        <div className="space-y-8 pb-10">
            <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                    <AlertTriangle className="text-red-500" /> Trung tâm Cảnh báo
                </h2>
                <p className="text-slate-400 mt-1">Các hạng mục cần ưu tiên xử lý tức thì</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Low Stock Alerts */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl border-t-4 border-t-amber-500">
                    <div className="p-6">
                        <h3 className="font-bold text-amber-500 flex items-center gap-2 mb-4">
                            <Box size={20} /> CẢNH BÁO TỒN KHO THẤP
                        </h3>
                        <div className="space-y-4">
                            {lowStock.length > 0 ? lowStock.map(p => (
                                <div key={p.id} className="p-4 bg-slate-800/50 rounded-xl flex items-center justify-between border border-amber-500/10">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-slate-100">{p.name}</span>
                                        <span className="text-[10px] text-slate-500 italic">Mã hàng: {p.id}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-red-500 font-bold mb-1">CÒN {(p.importQuantity - p.soldQuantity)} {p.unit}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold">Ngưỡng: 10</div>
                                    </div>
                                </div>
                            )) : <div className="text-slate-500 text-sm">Không có cảnh báo tồn kho.</div>}
                        </div>
                    </div>
                </div>

                {/* Overdue Contract Alerts */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl border-t-4 border-t-red-500">
                    <div className="p-6">
                        <h3 className="font-bold text-red-500 flex items-center gap-2 mb-4">
                            <FileText size={20} /> CẢNH BÁO NỢ QUÁ HẠN
                        </h3>
                        <div className="space-y-4">
                            {overdueContracts.length > 0 ? overdueContracts.map(c => (
                                <div key={c.id} className="p-4 bg-slate-800/50 rounded-xl border border-red-500/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-sm text-slate-100">{c.customer}</span>
                                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-extrabold rounded">NỢ QUÁ HẠN</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400">Số tiền nợ:</span>
                                        <span className="font-bold text-red-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.value - c.paidAmount)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400">Ngày quá hạn:</span>
                                        <span className="font-bold text-slate-100">{c.overdueDate || '---'}</span>
                                    </div>
                                </div>
                            )) : <div className="text-slate-500 text-sm">Không có nợ quá hạn.</div>}
                        </div>
                    </div>
                </div>

                {/* Warranty Alerts */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl border-t-4 border-t-blue-500">
                    <div className="p-6">
                        <h3 className="font-bold text-blue-500 flex items-center gap-2 mb-4">
                            <ShieldCheck size={20} /> CẢNH BÁO BẢO HÀNH
                        </h3>
                        <div className="space-y-4">
                           {expiringWarranties.length > 0 ? expiringWarranties.map(c => (
                                <div key={c.id} className="p-4 bg-slate-800/50 rounded-xl border border-blue-500/10 flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-sm">{c.name}</div>
                                        <div className="text-[10px] text-blue-400 font-bold uppercase">Sắp hết hạn trong 30 ngày</div>
                                    </div>
                                    <Clock size={20} className="text-blue-500" />
                                </div>
                            )) : <div className="text-slate-500 text-sm">Không có bảo hành sắp hết hạn.</div>}
                        </div>
                    </div>
                </div>

                {/* HR Alerts */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl border-t-4 border-t-purple-500">
                    <div className="p-6">
                        <h3 className="font-bold text-purple-500 flex items-center gap-2 mb-4">
                            <Users size={20} /> CẢNH BÁO NHÂN SỰ
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-800/50 rounded-xl border border-purple-500/10 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-sm">Nguyễn Quang Huy</div>
                                    <div className="text-[10px] text-red-400 font-bold uppercase">Nghỉ quá phép: 2 ngày</div>
                                </div>
                                <XCircle size={20} className="text-red-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* CRM Alerts */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl border-t-4 border-t-indigo-500">
                    <div className="p-6">
                        <h3 className="font-bold text-indigo-500 flex items-center gap-2 mb-4">
                            <UsersRound size={20} /> CẢNH BÁO CRM
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-800/50 rounded-xl border border-indigo-500/10 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-sm">Tập đoàn Hòa Phát</div>
                                    <div className="text-[10px] text-amber-500 font-bold uppercase">Chưa liên hệ &gt; 30 ngày</div>
                                </div>
                                <Clock size={20} className="text-amber-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DashboardView = ({ stats }: any) => {
    const totalQuoValue = stats.quotations.reduce((acc: number, q: any) => acc + q.grandTotal, 0);
    const successQuo = stats.quotations.filter((q: any) => q.status === 'THÀNH_CÔNG');
    const successRate = stats.quotations.length > 0 ? (successQuo.length / stats.quotations.length * 100).toFixed(1) : 0;
    const expiringQuo = stats.quotations.filter((q: any) => {
        const expiry = new Date(q.expiryDate);
        const today = new Date();
        const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diff > 0 && diff <= 5;
    });

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <LayoutDashboard className="text-blue-400" /> Tổng quan Doanh nghiệp
                    </h2>
                    <p className="text-slate-400 mt-1">Toàn cảnh tình hình hoạt động Công ty Linh Hân</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Thời gian hệ thống</p>
                    <p className="text-sm font-mono text-blue-400">{format(new Date(), 'HH:mm:ss dd/MM/yyyy')}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatCard label="Tổng Báo giá" value={stats.quotations.length} trend={`Chốt: ${successRate}%`} icon={FileText} color="blue" />
                <DashboardStatCard label="Giá trị Báo giá" value={(totalQuoValue / 1000000).toFixed(0) + 'M'} trend="Tổng tích lũy" icon={TrendingUp} color="emerald" />
                <DashboardStatCard label="Hàng trong Kho" value={stats.products.length} trend="Ổn định" icon={Box} color="orange" />
                <DashboardStatCard label="Sắp hết hạn BG" value={expiringQuo.length} trend="Cần xử lý gấp" icon={AlertTriangle} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                         <h3 className="font-bold text-slate-300">Biểu đồ Phễu Báo giá</h3>
                         <div className="flex gap-2">
                             <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Mới</span>
                             <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Đàm phán</span>
                             <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Thành công</span>
                         </div>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Mới tạo', val: stats.quotations.filter((q:any)=>q.status==='MỚI_TẠO').length },
                                { name: 'Đã gửi', val: stats.quotations.filter((q:any)=>q.status==='ĐÀ_GỬI').length },
                                { name: 'Đàm phán', val: stats.quotations.filter((q:any)=>q.status==='ĐANG_ĐÀM_PHÁN').length },
                                { name: 'Thành công', val: successQuo.length },
                                { name: 'Thất bại', val: stats.quotations.filter((q:any)=>q.status==='THẤT_BẠI').length }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                                <XAxis dataKey="name" stroke="#718096" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#718096" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '12px' }} />
                                <Bar dataKey="val" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                                    { [0,1,2,3,4].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#64748b', '#3b82f6', '#6366f1', '#10b981', '#ef4444'][index]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
                    <h3 className="font-bold text-slate-300 mb-6">Hiệu suất Chuyển đổi</h3>
                    <div className="space-y-6">
                        <ProgressItem label="Tỉ lệ Thành công" percent={Number(successRate)} color="bg-emerald-500" />
                        <ProgressItem label="Báo giá Đàm phán" percent={stats.quotations.length > 0 ? (stats.quotations.filter((q:any)=>q.status==='ĐANG_ĐÀM_PHÁN').length / stats.quotations.length * 100).toFixed(0) : 0} color="bg-indigo-500" />
                        <ProgressItem label="Báo giá Thất bại" percent={stats.quotations.length > 0 ? (stats.quotations.filter((q:any)=>q.status==='THẤT_BẠI').length / stats.quotations.length * 100).toFixed(0) : 0} color="bg-red-500" />
                    </div>
                    <div className="mt-10 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-3 mb-2">
                             <TrendingUp size={16} className="text-blue-400" />
                             <span className="text-xs font-bold text-slate-300 uppercase">Phân tích</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            {successQuo.length > 0 ? `Báo giá có tỉ lệ chốt đạt ${successRate}%. Năng lực cạnh tranh đang ở mức tốt.` : "Hệ thống chưa ghi nhận báo giá thành công trong kỳ này."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Internal components helpers
const StatCard = ({ label, value, icon: Icon, color, subtitle }: any) => {
  const colorMap: any = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  const selectedColor = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl border ${selectedColor}`}>
          <Icon size={24} />
        </div>
        <div className="flex flex-col items-end">
           <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{label}</span>
           {subtitle && <span className="text-[9px] text-slate-600 font-bold">{subtitle}</span>}
        </div>
      </div>
      <div className="text-3xl font-extrabold text-white tracking-tight">{value}</div>
    </div>
  );
};

const DashboardStatCard = ({ label, value, trend, icon: Icon, color }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg hover:border-slate-700 transition-all group">
         <div className="flex items-center gap-4 mb-4">
            <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 text-${color}-500 flex items-center justify-center`}>
                <Icon size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
         </div>
         <div className="flex items-end justify-between">
            <div className="text-3xl font-extrabold text-white">{value}</div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                    <TrendingUp size={10} /> {trend}
                </span>
                <span className="text-[10px] text-slate-600 uppercase">So tháng trước</span>
            </div>
         </div>
    </div>
);


const ProgressItem = ({ label, percent, color }: any) => (
    <div className="space-y-2">
        <div className="flex justify-between text-xs">
            <span className="text-slate-400">{label}</span>
            <span className="font-bold text-slate-200">{percent}%</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                className={`${color} h-full rounded-full`}
            />
        </div>
    </div>
);

const QuotationStatusBadge = ({ status }: { status: Quotation['status'] }) => {
    const config: Record<string, { label: string, color: string }> = {
        'MỚI_TẠO': { label: 'Nháp', color: 'bg-slate-500/20 text-slate-400' },
        'ĐÃ_GỬI': { label: 'Đã gửi', color: 'bg-blue-500/20 text-blue-400' },
        'ĐANG_ĐÀM_PHÁN': { label: 'Đàm phán', color: 'bg-indigo-500/20 text-indigo-400' },
        'THÀNH_CÔNG': { label: 'Thành công', color: 'bg-emerald-500/20 text-emerald-400' },
        'THẤT_BẠI': { label: 'Thất bại', color: 'bg-red-500/20 text-red-400' },
        'HẾT_HIỆU_LỰC': { label: 'Hết hạn', color: 'bg-red-500/20 text-red-400' }
    };
    const { label, color } = config[status] || config['MỚI_TẠO'];
    return <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tight ${color}`}>{label}</span>;
}

const QuotationView = ({ quotations, onAdd, onEdit, onDelete, onDuplicate, onViewDetail }: any) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filtered = quotations.filter((q: any) => {
        const matchSearch = q.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.customerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || q.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const isExpiring = (quotation: Quotation) => {
        const expiry = new Date(quotation.expiryDate);
        const today = new Date();
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
        return diffDays > 0 && diffDays <= 5;
    };

    const isExpired = (quotation: Quotation) => {
        const expiry = new Date(quotation.expiryDate);
        const today = new Date();
        return expiry < today;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold flex items-center gap-3">
                        <FileText className="text-blue-400" /> Quản lý Báo giá
                    </h2>
                    <p className="text-slate-400 mt-1">Lập, gửi và theo dõi hiệu suất báo giá dự án</p>
                </div>
                <button onClick={onAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-blue-900/20 transition-all">
                    <Plus size={20} /> TẠO BÁO GIÁ MỚI
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative col-span-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Tìm theo số BG, tên dự án, tên khách hàng..." 
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="MỚI_TẠO">Nháp</option>
                    <option value="ĐÃ_GỬI">Đã gửi</option>
                    <option value="ĐANG_ĐÀM_PHÁN">Đàm phán</option>
                    <option value="THÀNH_CÔNG">Thành công</option>
                    <option value="THẤT_BẠI">Thất bại</option>
                    <option value="HẾT_HIỆU_LỰC">Hết hiệu lực</option>
                </select>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-[10px] uppercase font-black tracking-widest text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Số BG / Tên Dự án</th>
                            <th className="px-6 py-4">Khách hàng / Chủ đầu tư</th>
                            <th className="px-6 py-4">Giá trị (VNĐ)</th>
                            <th className="px-6 py-4">Ngày hết hạn</th>
                            <th className="px-6 py-4 text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-center">Tệp</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {filtered.map((q: any) => {
                            const expiring = isExpiring(q);
                            const expired = isExpired(q);
                            return (
                                <motion.tr 
                                    layout
                                    key={q.id} 
                                    className={`hover:bg-slate-800/30 transition-colors ${expiring ? 'bg-amber-500/5 border-l-2 border-l-amber-500' : ''} ${expired ? 'bg-red-500/5 border-l-2 border-l-red-500' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-100 flex items-center gap-1.5 group cursor-pointer" onClick={() => onViewDetail(q)}>
                                                {q.id} <Eye size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                            </span>
                                            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">{q.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-300">{q.customerName}</span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-tight">{q.location}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono font-black text-blue-400">
                                            {new Intl.NumberFormat('vi-VN').format(q.grandTotal)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-bold ${expired ? 'text-red-500' : expiring ? 'text-amber-500' : 'text-slate-300'}`}>
                                                {format(new Date(q.expiryDate), 'dd/MM/yyyy')}
                                            </span>
                                            <span className="text-[9px] text-slate-500 italic">
                                                {format(new Date(q.date), 'dd/MM/yyyy')} (Lập)
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <QuotationStatusBadge status={q.status} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500">
                                            <HardDrive size={12} /> {q.attachments?.length || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => onViewDetail(q)} className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="Xem chi tiết"><Eye size={16} /></button>
                                            <button onClick={() => onEdit(q)} className="p-2 hover:bg-amber-500/10 text-amber-500 rounded-lg transition-colors" title="Sửa"><Edit size={16} /></button>
                                            <button onClick={() => onDuplicate(q)} className="p-2 hover:bg-emerald-500/10 text-emerald-400 rounded-lg transition-colors" title="Nhân bản"><Layers size={16} /></button>
                                            <button onClick={() => onDelete(q.id)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors" title="Xóa"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="p-20 text-center text-slate-500 italic">
                        Không tìm thấy báo giá nào phù hợp với bộ lọc.
                    </div>
                )}
            </div>
        </div>
    );
};

const QuotationModal = ({ isOpen, onClose, onSubmit, editingQuotation, employees }: any) => {
    const [activeTab, setActiveTab] = useState('basic');
    const [formData, setFormData] = useState<Partial<Quotation>>({
        id: '', name: '', type: 'Thi công', tenderPackage: '', preparedBy: '', preparerPhone: '', preparerEmail: '', department: 'Kinh doanh',
        date: format(new Date(), 'yyyy-MM-dd'), validityDays: 30, expiryDate: '',
        status: 'MỚI_TẠO', taxRate: 10, taxAmount: 0, 
        discountRate: 0, discountAmount: 0, subTotal: 0, grandTotal: 0,
        customerName: '', contactPerson: '', position: '', phone: '', email: '', location: 'Miền Nam', billingAddress: '', taxCode: '',
        items: [], attachments: [], history: [], internalNote: '', note: '', deliveryTime: '15 ngày'
    });

    useEffect(() => {
        if (editingQuotation) {
            setFormData(editingQuotation);
        } else {
            const date = new Date();
            const year = date.getFullYear();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30);
            
            setFormData({
                id: `BG-${year}-${random}`,
                name: '', type: 'Thi công', tenderPackage: '', preparedBy: '', preparerPhone: '', preparerEmail: '', department: 'Kinh doanh',
                date: format(new Date(), 'yyyy-MM-dd'), validityDays: 30, 
                expiryDate: format(expiry, 'yyyy-MM-dd'),
                status: 'MỚI_TẠO', taxRate: 10, taxAmount: 0, 
                discountRate: 0, discountAmount: 0, subTotal: 0, grandTotal: 0,
                customerName: '', contactPerson: '', position: '', phone: '', email: '', location: 'Miền Nam', billingAddress: '', taxCode: '',
                items: [], attachments: [], history: [{ timestamp: new Date().toISOString(), content: "Khởi tạo báo giá mới", user: "Hệ thống" }],
                internalNote: '', note: '', deliveryTime: '15 ngày'
            });
        }
        setActiveTab('basic');
    }, [editingQuotation, isOpen]);

    useEffect(() => {
        if (formData.date && formData.validityDays) {
            const date = new Date(formData.date);
            date.setDate(date.getDate() + Number(formData.validityDays));
            setFormData(prev => ({ ...prev, expiryDate: format(date, 'yyyy-MM-dd') }));
        }
    }, [formData.date, formData.validityDays]);

    useEffect(() => {
        const items = formData.items || [];
        const subTotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const discountAmount = (subTotal * (formData.discountRate || 0)) / 100;
        const totalAfterDiscount = subTotal - discountAmount;
        const taxAmount = (totalAfterDiscount * (formData.taxRate || 0)) / 100;
        const grandTotal = totalAfterDiscount + taxAmount;
        
        setFormData(prev => ({ ...prev, subTotal, discountAmount, taxAmount, grandTotal }));
    }, [formData.items, formData.taxRate, formData.discountRate]);

    const addItem = () => {
        const newItem = { id: Date.now().toString(), code: '', description: '', unit: 'Bộ', quantity: 1, unitPrice: 0, note: '' };
        setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    };

    const updateItem = (id: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            items: (prev.items || []).map((item: any) => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const removeItem = (id: string) => {
        setFormData(prev => ({ ...prev, items: (prev.items || []).filter((item: any) => item.id !== id) }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach((file: File) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                const newAttachment: any = {
                    id: Date.now().toString() + Math.random().toString(36).substring(7),
                    name: file.name, type: file.type, size: file.size, base64: base64,
                    uploadDate: new Date().toISOString(), category: 'Kỹ thuật'
                };
                setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAttachment] }));
            };
            reader.readAsDataURL(file);
        });
    };

    if (!isOpen) return null;

    const TabButton = ({ id, label, icon: Icon }: any) => (
        <button 
            type="button" 
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-bold text-xs transition-all ${activeTab === id ? 'border-blue-500 text-blue-500 bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
        >
            <Icon size={14} /> {label}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                            <FileText className="text-blue-400" />
                            {editingQuotation ? `Chỉnh sửa: ${editingQuotation.id}` : 'Lập Báo giá chuyên nghiệp'}
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Dữ liệu được bảo mật trong LocalStorage</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="flex border-b border-slate-800 bg-slate-900">
                    <TabButton id="basic" label="THÔNG TIN CƠ BẢN" icon={Info} />
                    <TabButton id="customer" label="THÔNG TIN KHÁCH HÀNG" icon={Users} />
                    <TabButton id="items" label="DANH MỤC HÀNG HÓA/DỊCH VỤ" icon={Package} />
                    <TabButton id="totals" label="TỔNG HỢP & PHÁT HÀNH" icon={CheckCircle} />
                </div>

                <form className="flex-1 overflow-y-auto p-8" onSubmit={(e) => {
                    e.preventDefault();
                    if (!formData.name || !formData.customerName) {
                        alert("Vui lòng nhập Tên báo giá và Tên khách hàng!");
                        return;
                    }
                    const finalData = {
                        ...formData,
                        updatedAt: new Date().toISOString(),
                        history: [...(formData.history || []), { 
                            timestamp: new Date().toISOString(), 
                            content: editingQuotation ? "Cập nhật thông tin báo giá" : "Lập và lưu báo giá dự án",
                            user: "Admin" 
                        }]
                    };
                    onSubmit(finalData as Quotation);
                }}>
                    {activeTab === 'basic' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-6">
                                <h4 className="border-l-4 border-blue-500 pl-3 text-xs font-black uppercase text-slate-400">Định danh & Phân loại</h4>
                                <InputField label="Số Báo giá" value={formData.id} disabled />
                                <InputField label="Tên Dự án / Gói thầu" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} required placeholder="Ví dụ: Thi công hạ tầng ICT Tòa nhà A..." />
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Loại Báo giá</label>
                                    <select className="bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all appearance-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                                        <option value="Thi công">Thi công</option>
                                        <option value="Cung cấp thiết bị">Cung cấp thiết bị</option>
                                        <option value="Tư vấn">Tư vấn</option>
                                        <option value="Dịch vụ">Dịch vụ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h4 className="border-l-4 border-indigo-500 pl-3 text-xs font-black uppercase text-slate-400">Người phụ trách</h4>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nhân viên lập</label>
                                    <select className="bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white appearance-none" value={formData.preparedBy} onChange={e => {
                                        const emp = employees.find((x:any) => x.name === e.target.value);
                                        setFormData({...formData, preparedBy: e.target.value, preparerPhone: emp?.phone || '', preparerEmail: emp?.email || ''});
                                    }}>
                                        <option value="">Chọn nhân viên...</option>
                                        {employees.map((e: any) => <option key={e.id} value={e.name}>{e.name} - {e.department}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="SĐT Nhân viên" value={formData.preparerPhone} onChange={(v: string) => setFormData({...formData, preparerPhone: v})} />
                                    <InputField label="Email Nhân viên" value={formData.preparerEmail} onChange={(v: string) => setFormData({...formData, preparerEmail: v})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Gói thầu (nếu có)" value={formData.tenderPackage} onChange={(v: string) => setFormData({...formData, tenderPackage: v})} />
                                    <InputField label="Thời gian giao hàng" value={formData.deliveryTime} onChange={(v: string) => setFormData({...formData, deliveryTime: v})} placeholder="Ví dụ: 15 ngày" />
                                </div>
                                <InputField label="Ghi chú nội bộ (không in)" value={formData.internalNote} onChange={(v: string) => setFormData({...formData, internalNote: v})} multiline />
                            </div>
                            <div className="space-y-6">
                                <h4 className="border-l-4 border-amber-500 pl-3 text-xs font-black uppercase text-slate-400">Thời gian hiệu lực</h4>
                                <InputField label="Ngày lập" type="date" value={formData.date} onChange={(v: string) => setFormData({...formData, date: v})} />
                                <InputField label="Số ngày hiệu lực" type="number" value={formData.validityDays} onChange={(v: string) => setFormData({...formData, validityDays: Number(v)})} />
                                <InputField label="Ngày hết hiệu lực" type="date" value={formData.expiryDate} disabled />
                            </div>
                        </div>
                    )}

                    {activeTab === 'customer' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h4 className="border-l-4 border-emerald-500 pl-3 text-xs font-black uppercase text-slate-400">Thông tin đơn vị / Tổ chức</h4>
                                <InputField label="Tên Khách hàng (Công ty/Cá nhân)" value={formData.customerName} onChange={(v: string) => setFormData({...formData, customerName: v})} required placeholder="Ví dụ: Công ty TNHH Giải pháp ABC" />
                                <InputField label="Địa chỉ xuất hóa đơn" value={formData.billingAddress} onChange={(v: string) => setFormData({...formData, billingAddress: v})} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Mã số thuế" value={formData.taxCode} onChange={(v: string) => setFormData({...formData, taxCode: v})} />
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Khu vực</label>
                                        <select className="bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white appearance-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value as any})}>
                                            <option value="Miền Bắc">Miền Bắc</option>
                                            <option value="Miền Trung">Miền Trung</option>
                                            <option value="Miền Nam">Miền Nam</option>
                                            <option value="Nước ngoài">Nước ngoài</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h4 className="border-l-4 border-pink-500 pl-3 text-xs font-black uppercase text-slate-400">Người liên hệ trực tiếp</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Họ tên người nhận" value={formData.contactPerson} onChange={(v: string) => setFormData({...formData, contactPerson: v})} />
                                    <InputField label="Chức vụ" value={formData.position} onChange={(v: string) => setFormData({...formData, position: v})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Số điện thoại" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} />
                                    <InputField label="Email" type="email" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'items' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h4 className="border-l-4 border-blue-400 pl-3 text-xs font-black uppercase text-slate-400">Chi tiết bảng giá</h4>
                                    <p className="text-[10px] text-slate-500 ml-4 mt-1 italic">* Hệ thống sẽ tự động tính toán tổng giá trị</p>
                                </div>
                                <button type="button" onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black transition-all">
                                    <Plus size={16} /> THÊM DÒNG MỚI
                                </button>
                            </div>
                            <div className="bg-slate-800/20 border border-slate-800 rounded-2xl overflow-hidden">
                                <table className="w-full text-left text-[11px]">
                                    <thead className="bg-slate-800/80 text-slate-400 uppercase font-black tracking-tight">
                                        <tr>
                                            <th className="px-4 py-3 w-12 text-center">STT</th>
                                            <th className="px-4 py-3 w-28">Mã HH</th>
                                            <th className="px-4 py-3">Tên HH / Dịch vụ chi tiết</th>
                                            <th className="px-4 py-3">Xuất xứ/Model/Nhãn mác</th>
                                            <th className="px-4 py-3 w-20 text-center">ĐVT</th>
                                            <th className="px-4 py-3 w-20 text-center">Số lượng</th>
                                            <th className="px-4 py-3 w-32 text-right">Đơn giá</th>
                                            <th className="px-4 py-3 w-32 text-right">Thành tiền</th>
                                            <th className="px-4 py-3 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {(formData.items || []).map((item: any, idx: number) => (
                                            <tr key={item.id} className="hover:bg-slate-800/30">
                                                <td className="px-4 py-2 text-center text-slate-500 font-bold">{idx + 1}</td>
                                                <td className="px-2 py-2">
                                                    <input className="w-full bg-slate-800 border-none rounded-lg p-2 text-blue-300 outline-none" value={item.code} onChange={e => updateItem(item.id, 'code', e.target.value)} placeholder="Mã..." />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <textarea className="w-full bg-slate-800 border-none rounded-lg p-2 text-slate-200 outline-none resize-none min-h-[40px]" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Tên hàng hóa/sản phẩm..." />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <textarea className="w-full bg-slate-800 border-none rounded-lg p-2 text-slate-400 outline-none resize-none min-h-[40px] text-[10px]" value={item.details} onChange={e => updateItem(item.id, 'details', e.target.value)} placeholder="Xuất xứ, Nhãn mác, Model..." />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input className="w-full bg-slate-800 border-none rounded-lg p-2 text-center text-slate-300" value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="number" className="w-full bg-slate-800 border-none rounded-lg p-2 text-center text-emerald-400 font-bold" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input type="number" className="w-full bg-slate-800 border-none rounded-lg p-2 text-right text-blue-400 font-mono font-bold" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))} />
                                                </td>
                                                <td className="px-4 py-2 text-right font-black text-white">
                                                    {new Intl.NumberFormat('vi-VN').format(item.quantity * item.unitPrice)}
                                                </td>
                                                <td className="px-2 py-2 text-center">
                                                    <button type="button" onClick={() => removeItem(item.id)} className="p-1.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={14} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {(formData.items || []).length === 0 && (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-10 text-center text-slate-600 italic">Chưa có dòng dữ liệu nào. Nhấn nút "Thêm dòng mới" để bắt đầu.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-slate-800/40 font-black">
                                        <tr>
                                            <td colSpan={6} className="px-4 py-4 text-right uppercase text-slate-500 tracking-widest text-[10px]">Tạm tính (chưa VAT)</td>
                                            <td className="px-4 py-4 text-right text-blue-400 text-lg">{new Intl.NumberFormat('vi-VN').format(formData.subTotal || 0)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'totals' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="md:col-span-1 space-y-6">
                                <h4 className="border-l-4 border-amber-500 pl-3 text-xs font-black uppercase text-slate-400">Chiết khấu & Thuế</h4>
                                <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                                    <div className="space-y-4">
                                        <InputField label="Chiết khấu (%)" type="number" value={formData.discountRate} onChange={(v: string) => setFormData({...formData, discountRate: Number(v)})} />
                                        <div className="flex gap-1">
                                            {[0, 5, 10, 15, 20].map(v => (
                                                <button key={v} type="button" onClick={() => setFormData({...formData, discountRate: v})} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${formData.discountRate === v ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>{v}%</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <InputField label="Thuế VAT (%)" type="number" value={formData.taxRate} onChange={(v: string) => setFormData({...formData, taxRate: Number(v)})} />
                                        <div className="flex gap-1">
                                            {[0, 8, 10].map(v => (
                                                <button key={v} type="button" onClick={() => setFormData({...formData, taxRate: v})} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${formData.taxRate === v ? 'bg-amber-600 text-black shadow-lg' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}>{v}%</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <h4 className="border-l-4 border-slate-500 pl-3 text-xs font-black uppercase text-slate-400 mt-8">Đính kèm hồ sơ kỹ thuật</h4>
                                <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-all cursor-pointer relative group">
                                    <Upload className="mx-auto text-slate-600 group-hover:text-blue-500 mb-2" size={24} />
                                    <p className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300">Nhấp để tải lên hồ sơ...</p>
                                    <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                                </div>
                                <div className="space-y-2 mt-4">
                                    {formData.attachments?.map((f: any) => (
                                        <div key={f.id} className="flex items-center justify-between p-2 bg-slate-800 rounded-lg border border-slate-700">
                                            <span className="text-[10px] font-bold text-slate-300 truncate max-w-[150px]">{f.name}</span>
                                            <button type="button" onClick={() => setFormData(prev => ({...prev, attachments: prev.attachments?.filter((a:any)=>a.id !== f.id)}))} className="text-red-500 p-1 hover:bg-red-500/10 rounded"><Trash2 size={12}/></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-6">
                                <h4 className="border-l-4 border-blue-500 pl-3 text-xs font-black uppercase text-slate-400">Xác nhận kết quả & Ghi chú điều khoản</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Trạng thái hiện tại</label>
                                        <select className="bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm font-black text-blue-400 outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                                            <option value="MỚI_TẠO">Nháp / Mới tạo</option>
                                            <option value="ĐÃ_GỬI">Đã gửi khách hàng</option>
                                            <option value="ĐANG_ĐÀM_PHÁN">Đang đàm phán</option>
                                            <option value="THÀNH_CÔNG">Đồng ý / Chốt hợp đồng</option>
                                            <option value="THẤT_BẠI">Từ chối / Thất bại</option>
                                            <option value="HẾT_HIỆU_LỰC">Hết hiệu lực</option>
                                        </select>
                                    </div>
                                    <InputField label="Số hợp đồng (nếu đã chốt)" value={formData.contractNumber} onChange={(v: string) => setFormData({...formData, contractNumber: v})} placeholder="Mã HĐ..." />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ghi chú & Điều khoản chung</label>
                                        <div className="flex gap-1">
                                            {["Bảo hành 12th", "Tạm ứng 30%", "Hiệu lực 30 ngày"].map(t => (
                                                <button key={t} type="button" onClick={() => setFormData(prev => ({...prev, note: (prev.note ? prev.note + '\n' : '') + t}))} className="text-[9px] bg-slate-800 text-slate-400 px-2 py-1 rounded-md border border-slate-700 hover:text-white transition-all">+ {t}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-300 min-h-[140px] resize-none" value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder="Nhập các điều kiện thanh toán, bảo hành, vận chuyển..." />
                                </div>

                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20">
                                    <div className="flex justify-between items-end border-b border-white/20 pb-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200 opacity-80 mb-2">TỔNG CỘNG THANH TOÁN</p>
                                            <h5 className="text-4xl font-black">{new Intl.NumberFormat('vi-VN').format(formData.grandTotal || 0)} <span className="text-xl">VNĐ</span></h5>
                                        </div>
                                        <div className="text-right text-[10px] space-y-1">
                                            <p className="flex justify-between gap-10">TỔNG TIỀN HÀNG: <span className="font-mono font-bold">{new Intl.NumberFormat('vi-VN').format(formData.subTotal || 0)}</span></p>
                                            {Number(formData.discountAmount || 0) > 0 && <p className="flex justify-between gap-10 text-orange-200">CHIẾT KHẤU ({formData.discountRate}%): <span className="font-mono font-bold">-{new Intl.NumberFormat('vi-VN').format(formData.discountAmount || 0)}</span></p>}
                                            <p className="flex justify-between gap-10 text-blue-100">THUẾ GTGT ({formData.taxRate}%): <span className="font-mono font-bold">+{new Intl.NumberFormat('vi-VN').format(formData.taxAmount || 0)}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-10 flex gap-4 border-t border-slate-800 mt-8">
                        <button type="button" onClick={onClose} className="px-8 py-3 border border-slate-700 rounded-2xl font-bold text-slate-500 hover:bg-slate-800 transition-all">THOÁT</button>
                        <div className="flex-1 flex gap-3">
                            {activeTab !== 'totals' ? (
                                <button type="button" onClick={() => {
                                    const tabs = ['basic', 'customer', 'items', 'totals'];
                                    setActiveTab(tabs[tabs.indexOf(activeTab) + 1]);
                                }} className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all">TIẾP THEO</button>
                            ) : (
                                <button type="submit" className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all">LƯU & XÁC NHẬN BÁO GIÁ</button>
                            )}
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const numberToVietnameseWords = (amount: number): string => {
    if (amount === 0) return "Không đồng";
    
    const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
    const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];
    
    const readGroup = (group: number, showZero: boolean): string => {
        let res = "";
        const h = Math.floor(group / 100);
        const t = Math.floor((group % 100) / 10);
        const u = group % 10;
        
        if (h > 0 || showZero) {
            res += digits[h] + " trăm ";
        }
        
        if (t === 0) {
            if (u > 0 && (h > 0 || showZero)) res += "lẻ ";
        } else if (t === 1) {
            res += "mười ";
        } else {
            res += digits[t] + " mươi ";
        }
        
        if (u === 1) {
            if (t > 1) res += "mốt";
            else res += "một";
        } else if (u === 5) {
            if (t > 0) res += "lăm";
            else res += "năm";
        } else if (u > 0) {
            res += digits[u];
        }
        
        return res.trim();
    };
    
    let res = "";
    let groupIdx = 0;
    let temp = Math.abs(Math.floor(amount));
    
    while (temp > 0) {
        const group = temp % 1000;
        if (group > 0) {
            const groupStr = readGroup(group, temp > 1000);
            res = groupStr + " " + units[groupIdx] + " " + res;
        }
        temp = Math.floor(temp / 1000);
        groupIdx++;
    }
    
    res = res.trim();
    if (res.endsWith("lẻ")) res = res.substring(0, res.length - 2).trim();
    
    return res.charAt(0).toUpperCase() + res.slice(1) + " đồng chẵn./.";
};

const QuotationDetailModal = ({ isOpen, onClose, quotation }: any) => {
    if (!isOpen || !quotation) return null;

    const handleExportPDF = () => {
        const element = document.getElementById('printable-quotation');
        const opt = {
            margin: 0,
            filename: `Bao_Gia_${quotation.id}.pdf`,
            image: { type: 'jpeg' as const, quality: 1 },
            html2canvas: { scale: 3, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        
        // Hide buttons during export
        const buttons = document.querySelector('.no-print');
        if (buttons) (buttons as HTMLElement).style.display = 'none';
        
        html2pdf().from(element).set(opt).save().then(() => {
            if (buttons) (buttons as HTMLElement).style.display = 'flex';
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-0 md:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
            <style>
                {`
                @media print {
                    @page { size: A4; margin: 10mm; }
                    body * { visibility: hidden; }
                    #printable-quotation, #printable-quotation * { visibility: visible; }
                    #printable-quotation { position: absolute; left: 0; top: 0; width: 100% !important; margin: 0 !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
                    .no-print { display: none !important; }
                }
                `}
            </style>
            <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-6 md:p-10 shadow-2xl relative print:p-0 print-container rounded-3xl print:rounded-none"
                onClick={e => e.stopPropagation()}
                id="printable-quotation"
            >
                {/* Header Section */}
                <div className="flex justify-center mb-4 border-b border-blue-100 pb-3">
                    <div className="flex items-center gap-2">
                        <img src={logoHl} alt="Logo" className="h-14 w-14 object-contain" referrerPolicy="no-referrer" />
                        <div className="flex-1">
                            <h2 className="text-[14px] font-bold text-blue-800 leading-tight">CÔNG TY TNHH ĐẦU TƯ SẢN XUẤT <span className="text-red-600 uppercase">Linh Hân</span></h2>
                            <p className="text-[10px] text-slate-700 leading-relaxed">
                                <span className="font-bold">Địa chỉ:</span> Số 118/23 đường Trần Thị Năm, P. Trung Mỹ Tây, Tp.HCM<br />
                                <span className="font-bold">Email:</span> ketoanlinhhan.hl@gmail.com <span className="ml-4 font-bold">Hotline:</span> 0909 720 849<br />
                                <span className="font-bold text-blue-600 underline">www.hlvietnam.vn</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-2 border-black p-0.5 mb-4 text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">
                    <h1 className="text-[16px] font-black uppercase tracking-widest text-slate-900 line-height-1">BẢNG BÁO GIÁ</h1>
                </div>

                {/* Info grid */}
                <div className="border border-black mb-4 overflow-hidden relative">
                    {/* Vertical divider line */}
                    <div className="absolute top-0 bottom-0 left-[54.545%] w-px bg-black z-10 print:bg-black"></div>
                    <div className="grid grid-cols-[6fr_5fr] relative z-0">
                        {/* Row 1 */}
                        <div className="flex items-center px-2 py-1 min-h-[28px] border-b border-dotted border-black/40">
                            <span className="w-24 text-[12px] flex-shrink-0">Kính gửi:</span>
                            <span className="text-[12px] font-bold uppercase text-slate-900 truncate">{quotation.customerName}</span>
                        </div>
                        <div className="flex items-center px-2 py-1 min-h-[28px] border-b border-dotted border-black/40">
                            <span className="w-24 text-[12px] flex-shrink-0">Số báo giá:</span>
                            <span className="text-[12px] font-bold text-blue-700">{quotation.id}</span>
                        </div>

                        {/* Row 2 */}
                        <div className="flex items-center px-2 py-1 min-h-[28px] border-b border-dotted border-black/40">
                            <span className="w-24 text-[12px] flex-shrink-0 font-bold">Địa chỉ:</span>
                            <span className="text-[12px] truncate">{quotation.billingAddress}</span>
                        </div>
                        <div className="flex items-center px-2 py-1 min-h-[28px] border-b border-dotted border-black/40">
                            <span className="w-24 text-[12px] flex-shrink-0">Ngày lập:</span>
                            <span className="text-[12px]">{format(new Date(quotation.date), 'dd/MM/yyyy')}</span>
                        </div>

                        {/* Row 3 */}
                        <div className="flex items-center px-2 py-1 min-h-[28px] border-b border-dotted border-black/40">
                            <span className="w-24 text-[12px] flex-shrink-0">Người liên hệ:</span>
                            <span className="text-[12px] font-bold truncate">{quotation.contactPerson}</span>
                        </div>
                        <div className="flex items-center px-2 py-1 min-h-[28px] border-b border-dotted border-black/40">
                            <span className="w-24 text-[12px] flex-shrink-0">Nhân viên lập:</span>
                            <span className="text-[12px] font-bold truncate">{quotation.preparedBy}</span>
                        </div>

                        {/* Row 4 */}
                        <div className="flex items-center px-2 py-1 min-h-[28px] border-b border-dotted border-black/40">
                            <span className="w-24 text-[12px] flex-shrink-0">Điện thoại:</span>
                            <span className="text-[12px] text-slate-900">{quotation.phone}</span>
                        </div>
                        <div className="flex items-center px-2 py-1 min-h-[28px] border-b border-dotted border-black/40">
                            <span className="w-24 text-[12px] flex-shrink-0">Điện thoại:</span>
                            <span className="text-[12px] text-slate-900">{quotation.preparerPhone || ""}</span>
                        </div>

                        {/* Row 5 */}
                        <div className="flex items-center px-2 py-1 min-h-[28px] border-b border-dotted border-black/40">
                            <span className="w-24 text-[12px] flex-shrink-0">E-mail:</span>
                            <span className="text-[12px] text-blue-600 font-bold truncate">{quotation.email}</span>
                        </div>
                        <div className="flex items-center px-2 py-1 min-h-[28px] border-b border-dotted border-black/40">
                            <span className="w-24 text-[12px] flex-shrink-0">E-mail:</span>
                            <span className="text-[12px] text-slate-900 truncate">{quotation.preparerEmail || ""}</span>
                        </div>

                        {/* Row 6 */}
                        <div className="flex items-center px-2 py-1 min-h-[28px]">
                            <span className="w-24 text-[12px] flex-shrink-0">Dự án:</span>
                            <span className="text-[12px] font-bold text-slate-800 truncate">{quotation.name}</span>
                        </div>
                        <div className="flex items-center px-2 py-1 min-h-[28px]">
                            <span className="w-24 text-[12px] flex-shrink-0 font-bold">Hiệu lực đến:</span>
                            <span className="text-[12px] font-bold text-red-600">{format(new Date(quotation.expiryDate), 'dd/MM/yyyy')}</span>
                        </div>
                    </div>
                </div>


                <p className="text-[13px] mb-4 italic">Công ty Linh Hân xin trân trọng gửi đến Quý đơn vị bảng báo giá các sản phẩm và dịch vụ của chúng tôi cung cấp như sau:</p>

                {/* Table */}
                <div className="border border-black overflow-hidden mb-1">
                    <table className="w-full border-collapse text-[13px]">
                        <thead className="bg-[#d9eef2] border-b border-black">
                            <tr className="divide-x divide-black">
                                <th className="p-2 w-10 text-center uppercase font-black align-top">STT</th>
                                <th className="p-2 text-center uppercase font-black align-top">DANH MỤC HÀNG HÓA</th>
                                <th className="p-2 w-16 text-center uppercase font-black align-top">SỐ LƯỢNG</th>
                                <th className="p-2 w-16 text-center uppercase font-black align-top">ĐƠN VỊ</th>
                                <th className="p-2 text-center uppercase font-black w-1/3 align-top">THÔNG SỐ KỸ THUẬT / CHI TIẾT</th>
                                <th className="p-2 w-28 text-center uppercase font-black align-top">ĐƠN GIÁ (VNĐ)</th>
                                <th className="p-2 w-28 text-center uppercase font-black align-top">THÀNH TIỀN (VNĐ)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black">
                            {quotation.items?.map((item: any, idx: number) => (
                                <tr key={item.id} className="divide-x divide-black align-top">
                                    <td className="p-2 text-center">{idx + 1}</td>
                                    <td className="p-2">
                                        <div className="font-bold text-[12px] mb-0.5">{item.description}</div>
                                        {item.code && <div className="text-[10px] text-slate-700 italic font-bold">{item.code}</div>}
                                    </td>
                                    <td className="p-2 text-center">{item.quantity}</td>
                                    <td className="p-2 text-center">{item.unit}</td>
                                    <td className="p-2 whitespace-pre-wrap text-[11px] leading-relaxed">
                                        {item.details || "N/A"}
                                    </td>
                                    <td className="p-2 text-right">
                                        {new Intl.NumberFormat('vi-VN').format(item.unitPrice)}
                                    </td>
                                    <td className="p-2 text-right font-bold">
                                        {new Intl.NumberFormat('vi-VN').format(item.quantity * item.unitPrice)}
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-[#fce5cd] font-bold border-t border-black divide-x divide-black">
                                <td colSpan={5} className="p-2 text-center uppercase text-[11px] tracking-tight">
                                    TỔNG CỘNG GIÁ CỦA HÀNG HÓA ĐÃ BAO GỒM THUẾ, PHÍ, LỆ PHÍ (NẾU CÓ)
                                </td>
                                <td colSpan={2} className="p-2 text-right text-[14px] font-black text-red-700">
                                    {new Intl.NumberFormat('vi-VN').format(quotation.grandTotal)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer Section */}
                <div className="mt-1 grid grid-cols-12 gap-6 px-2">
                    <div className="col-span-7 space-y-2">
                        <div className="pt-1">
                            <p className="text-[12px] leading-relaxed"><span className="font-bold underline italic">Bằng chữ:</span> <span className="italic font-bold text-slate-700">{numberToVietnameseWords(quotation.grandTotal)}</span></p>
                        </div>
                        <p className="text-[11px] font-bold italic underline">Ghi chú và điều khoản chung:</p>
                        <div className="text-[10px] italic text-slate-800 ml-2 whitespace-pre-wrap">
                            {quotation.note || "N/A"}
                        </div>
                    </div>
                    <div className="col-span-5 text-center flex flex-col items-center mt-2">
                        <p className="text-[11px] font-black uppercase text-blue-900 mb-0 whitespace-nowrap">CÔNG TY TNHH ĐẦU TƯ SẢN XUẤT LINH HÂN</p>
                        <div className="h-20"></div>
                        <p className="text-[13px] font-black uppercase text-slate-900 mt-auto leading-none">TRẦN ANH TÚ</p>
                    </div>
                </div>

                {/* Control Buttons */}
                <div className="mt-16 flex justify-end gap-3 no-print pt-8 border-t border-slate-100">
                    <button onClick={onClose} className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95">
                        ĐÓNG
                    </button>
                    <button onClick={handleExportPDF} className="px-8 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-xl">
                        <FileText size={18} /> XUẤT PDF
                    </button>
                    <button onClick={() => window.print()} className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-600/30">
                        <Printer size={18} /> IN BÁO GIÁ (A4)
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const ChangePasswordModal = ({ isOpen, onClose, onSubmit, newPassword, setNewPassword, confirmPassword, setConfirmPassword }: any) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-8 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white">
                            <Settings size={20} />
                        </div>
                        <h3 className="text-xl font-bold">Đổi mật khẩu</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Mật khẩu mới</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="password" 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Tối thiểu 6 ký tự"
                                minLength={6}
                                required
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Xác nhận mật khẩu</label>
                        <div className="relative">
                            <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-700 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-all">HUỶ</button>
                        <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg">CẬP NHẬT</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const ImportContractView = ({ contracts, onAdd, onEdit, onDelete, onViewDetail }: any) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [quickFilter, setQuickFilter] = useState('');

  const filteredContracts = contracts.filter((c: ImportContract) => {
    const matchesSearch = 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.seller.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || c.status === statusFilter;
    
    let matchesQuick = true;
    if (quickFilter === 'WARRANTY') {
      const daysLeft = differenceInDays(parseISO(c.warrantyEndDate), new Date());
      matchesQuick = c.hasWarranty && daysLeft <= 90;
    } else if (quickFilter === 'UNPAID') {
      matchesQuick = c.paymentStatus !== 'ĐÃ_THANH_TOÁN_ĐỦ';
    } else if (quickFilter === 'PENDING') {
      matchesQuick = c.status === 'ĐANG_THỰC_HIỆN' || c.status === 'MỚI_TẠO';
    }

    return matchesSearch && matchesStatus && matchesQuick;
  });

  const getStatusBadge = (status: ImportContractStatus) => {
    switch (status) {
      case 'MỚI_TẠO': return <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-bold">MỚI TẠO</span>;
      case 'ĐANG_THỰC_HIỆN': return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[10px] font-bold">ĐANG THỰC HIỆN</span>;
      case 'HÀNG_ĐÃ_VỀ': return <span className="px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded-full text-[10px] font-bold">HÀNG ĐÃ VỀ</span>;
      case 'HOÀN_THÀNH': return <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-full text-[10px] font-bold">HOÀN THÀNH</span>;
      case 'TẠM_DỪNG': return <span className="px-2 py-1 bg-slate-500/10 text-slate-500 rounded-full text-[10px] font-bold">TẠM DỪNG</span>;
      case 'HỦY': return <span className="px-2 py-1 bg-red-500/10 text-red-500 rounded-full text-[10px] font-bold">HỦY</span>;
      default: return null;
    }
  };

  const exportCSV = () => {
    const headers = ["Số HĐ", "Tên HĐ", "Bên bán", "Ngày ký", "Ngày nhập dự kiến", "Tổng giá trị VNĐ", "Trạng thái"];
    const rows = filteredContracts.map((c: ImportContract) => [
      c.id, c.name, c.seller, c.signDate, c.expectedImportDate, c.finalTotalVND, c.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + 
      headers.join(",") + "\n" + 
      rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "danh_sach_hd_nhap_khau.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Truck className="text-blue-500" /> Quản lý Hợp đồng Nhập khẩu
          </h2>
          <p className="text-slate-400 mt-1">Quản lý mua hàng ngoại, theo dõi hàng về và bảo hành thiết bị</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center gap-2 text-sm font-bold transition-all no-print">
            <Download size={18} /> Xuất CSV
          </button>
          <button onClick={onAdd} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20 transition-all no-print">
            <Plus size={20} /> Thêm HĐ nhập khẩu
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center no-print">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Tìm theo số HĐ, tên, nhà cung cấp..." 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-slate-800 border border-slate-700 rounded-xl py-2 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="MỚI_TẠO">Mới tạo</option>
          <option value="ĐANG_THỰC_HIỆN">Đang thực hiện</option>
          <option value="HÀNG_ĐÃ_VỀ">Hàng đã về</option>
          <option value="HOÀN_THÀNH">Hoàn thành</option>
          <option value="TẠM_DỪNG">Tạm dừng</option>
          <option value="HỦY">Hủy</option>
        </select>
        <div className="flex gap-2">
          <button 
            onClick={() => setQuickFilter(quickFilter === 'WARRANTY' ? '' : 'WARRANTY')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${quickFilter === 'WARRANTY' ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Bảo hành sắp hết
          </button>
          <button 
            onClick={() => setQuickFilter(quickFilter === 'UNPAID' ? '' : 'UNPAID')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${quickFilter === 'UNPAID' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            Chưa thanh toán đủ
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-[10px] uppercase tracking-wider">
              <th className="p-4 font-black">Số HĐ / Tên</th>
              <th className="p-4 font-black">Bên bán / Xuất xứ</th>
              <th className="p-4 font-black">Ngày ký / Nhập</th>
              <th className="p-4 font-black">Giá trị (VNĐ)</th>
              <th className="p-4 font-black">Thanh toán</th>
              <th className="p-4 font-black">Bảo hành</th>
              <th className="p-4 font-black">Trạng thái</th>
              <th className="p-4 font-black text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredContracts.map((c: ImportContract) => {
              const daysLeft = c.hasWarranty ? differenceInDays(parseISO(c.warrantyEndDate), new Date()) : 999;
              const isOverdueState = c.isOverdue;
              
              return (
                <tr key={c.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="p-4">
                    <div className="font-bold text-blue-400">{c.id}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[200px]">{c.name}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold">{c.seller}</div>
                    <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                      <Globe size={10} /> {c.originCountry}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-xs">Ký: {format(parseISO(c.signDate), 'dd/MM/yyyy')}</div>
                    <div className="text-xs text-slate-500">Nhập: {format(parseISO(c.expectedImportDate), 'dd/MM/yyyy')}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-emerald-500">{new Intl.NumberFormat('vi-VN').format(c.totalAmountVND || c.finalTotalVND)}</div>
                    <div className="text-[10px] text-slate-500">{c.currency} {new Intl.NumberFormat('en-US').format(c.totalAmountForeign || c.totalGoodsForeign)}</div>
                  </td>
                  <td className="p-4">
                    <div className={`text-[10px] font-bold ${c.paymentStatus === 'ĐÃ_THANH_TOÁN_ĐỦ' ? 'text-green-500' : 'text-amber-500'}`}>
                      {c.paymentStatus?.replace(/_/g, ' ') || 'CHƯA THANH TOÁN'}
                    </div>
                    {isOverdueState && <div className="text-[10px] text-red-500 flex items-center gap-1 mt-1 font-bold"><AlertTriangle size={10} /> Nợ quá hạn</div>}
                  </td>
                  <td className="p-4">
                    {c.hasWarranty ? (
                      <div className={`flex flex-col ${daysLeft <= 30 ? 'text-red-500' : daysLeft <= 90 ? 'text-yellow-500' : 'text-slate-500'}`}>
                        <div className="text-[10px] font-bold flex items-center gap-1">
                          <ShieldCheck size={12} /> {daysLeft > 0 ? `${daysLeft} ngày` : 'Hết hạn'}
                        </div>
                        <div className="text-[8px] uppercase">{format(parseISO(c.warrantyEndDate), 'dd/MM/yyyy')}</div>
                      </div>
                    ) : (
                      <span className="text-slate-600 text-[10px]">N/A</span>
                    )}
                  </td>
                  <td className="p-4">{getStatusBadge(c.status)}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                      <button onClick={() => onViewDetail(c)} className="p-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-slate-400 hover:text-white transition-all"><Eye size={16} /></button>
                      <button onClick={() => onEdit(c)} className="p-2 bg-slate-800 hover:bg-emerald-600 rounded-lg text-slate-400 hover:text-white transition-all"><Edit size={16} /></button>
                      <button onClick={() => onDelete(c.id)} className="p-2 bg-slate-800 hover:bg-red-600 rounded-lg text-slate-400 hover:text-white transition-all"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredContracts.length === 0 && (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-3">
                    <Ship size={48} className="text-slate-800" />
                    <p>Không tìm thấy hợp đồng nhập khẩu nào.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const ImportContractDetailModal = ({ isOpen, onClose, contract }: any) => {
  if (!isOpen || !contract) return null;

  const handlePrint = () => { window.print(); };

  const handleExportPDF = async () => {
    const element = document.getElementById('import-contract-print');
    const opt = {
      margin: 10,
      filename: `HD_NK_${contract.id}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white text-slate-900 w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl relative flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto p-10 print-container" id="import-contract-print">
          <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-24 h-16 bg-white p-1">
                <img src={logoHl} alt="HL Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-black text-blue-900 leading-none">CÔNG TY TNHH ĐẦU TƯ SẢN XUẤT LINH HÂN</h1>
                <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-tighter">Địa chỉ: Đường Trương Định, Khu phố 2, Phường Tân Mai, Biên Hòa, Đồng Nai</p>
                <p className="text-[10px] text-slate-500 font-bold">Hotline: 0909720849 | Email: hoikhanhdo.rfrvn@gmail.com</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-black text-sm mb-2 shadow-lg">CHI TIẾT HỢP ĐỒNG NHẬP KHẨU</div>
              <p className="text-lg font-black text-slate-900">{contract.id}</p>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 mb-8">
            <div className="space-y-4">
              <div className="border-l-4 border-blue-600 pl-4 bg-slate-50 p-4 rounded-r-xl">
                <h3 className="text-xs font-black text-blue-600 uppercase mb-3">Thông tin cơ bản</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tên hợp đồng:</span>
                    <span className="font-bold text-right">{contract.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Ngày ký:</span>
                    <span className="font-bold">{format(parseISO(contract.signDate), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Dự kiến nhập:</span>
                    <span className="font-bold">{format(parseISO(contract.expectedImportDate), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200 uppercase font-bold text-[10px]">
                    <span className="text-slate-500">Trạng thái:</span>
                    <span className="text-blue-600">{contract.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="border-l-4 border-amber-600 pl-4 bg-slate-50 p-4 rounded-r-xl">
                <h3 className="text-xs font-black text-amber-600 uppercase mb-3">Nhà cung cấp</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Bên bán:</span>
                    <span className="font-bold text-right">{contract.seller}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Quốc gia:</span>
                    <span className="font-bold uppercase tracking-wider">{contract.originCountry}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <table className="w-full border-collapse border border-slate-200 mb-8">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-600">
                <th className="border border-slate-200 p-2 w-10">STT</th>
                <th className="border border-slate-200 p-2 text-left">Hàng hóa</th>
                <th className="border border-slate-200 p-2 text-center w-16">SL</th>
                <th className="border border-slate-200 p-2 text-center w-16">ĐVT</th>
                <th className="border border-slate-200 p-2 text-right">Đơn giá ({contract.currency})</th>
                <th className="border border-slate-200 p-2 text-right">Thành tiền (VNĐ)</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {contract.items.map((item: any, idx: number) => (
                <tr key={item.id}>
                  <td className="border border-slate-200 p-2 text-center">{idx + 1}</td>
                  <td className="border border-slate-200 p-2">
                    <p className="font-bold">{item.description}</p>
                    <p className="text-[10px] text-slate-500">{item.sku}</p>
                  </td>
                  <td className="border border-slate-200 p-2 text-center font-bold">{item.quantity}</td>
                  <td className="border border-slate-200 p-2 text-center uppercase tracking-tighter">{item.unit}</td>
                  <td className="border border-slate-200 p-2 text-right font-mono">{new Intl.NumberFormat('en-US').format(item.unitPriceForeign)}</td>
                  <td className="border border-slate-200 p-2 text-right font-bold font-mono">{new Intl.NumberFormat('vi-VN').format(item.totalVND)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                <span>Tổng giá trị hàng:</span>
                <span className="font-mono text-slate-900">{new Intl.NumberFormat('vi-VN').format(contract.totalGoodsVND)} VNĐ</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                <span>Thuế VAT:</span>
                <span className="font-mono text-slate-900">{new Intl.NumberFormat('vi-VN').format(contract.totalVATVND)} VNĐ</span>
              </div>
              <div className="flex justify-between text-lg font-black uppercase text-red-600 border-t-2 border-slate-900 pt-2 mt-4">
                <span>Tổng cộng:</span>
                <span className="font-mono">{new Intl.NumberFormat('vi-VN').format(contract.finalTotalVND)} VNĐ</span>
              </div>
              <p className="text-[10px] text-right text-slate-500 italic font-bold">Bằng chữ: {numberToTextVietnamese(contract.finalTotalVND)}</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 no-print">
          <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase hover:bg-slate-100 transition-all">Đóng</button>
          <button onClick={handleExportPDF} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase hover:bg-black transition-all flex items-center gap-2 shadow-lg"><Download size={14} /> PDF</button>
          <button onClick={handlePrint} className="px-8 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"><Printer size={14} /> In A4</button>
        </div>
      </motion.div>
    </div>
  );
};

const ImportContractModal = ({ isOpen, onClose, onSubmit, editingContract }: any) => {
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState<Partial<ImportContract>>({});

  useEffect(() => {
    if (editingContract) {
      setFormData(editingContract);
    } else {
      setFormData({
        id: '',
        name: '',
        signDate: format(new Date(), 'yyyy-MM-dd'),
        expectedImportDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
        seller: '',
        originCountry: '',
        sellerRepresentative: '',
        sellerContact: '',
        currency: 'USD',
        exchangeRate: 25450,
        incoterms: 'CIF',
        paymentMethod: 'T/T',
        billOfLading: '',
        departurePort: '',
        arrivalPort: 'Cát Lái, TP.HCM',
        status: 'MỚI_TẠO',
        internalNote: '',
        hasWarranty: true,
        warrantyMonths: 12,
        warrantyStartDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd'),
        warrantyEndDate: format(addMonths(new Date(), 13), 'yyyy-MM-dd'),
        warrantyTerms: 'Bảo hành lỗi kỹ thuật từ nhà sản xuất.',
        items: [],
        intlShippingFeeForeign: 0,
        intlShippingFeeVND: 0,
        domesticShippingFeeVND: 0,
        otherFeesVND: 0,
        paidAmountForeign: 0,
        paidAmountVND: 0,
        paymentStatus: 'CHƯA_THANH_TOÁN',
        attachments: []
      });
    }
    setActiveTab(1);
  }, [editingContract, isOpen]);

  const calculateTotals = (data: Partial<ImportContract>) => {
    const rate = data.exchangeRate || 1;
    let totalGoodsForeign = 0;
    let totalGoodsVND = 0;
    let totalVATForeign = 0;
    let totalVATVND = 0;

    const items = (data.items || []).map(item => {
      const lineTotalForeign = item.quantity * item.unitPriceForeign;
      const vatAmountForeign = (lineTotalForeign * item.vatRate) / 100;
      const lineTotalVND = lineTotalForeign * rate;
      const vatAmountVND = vatAmountForeign * rate;
      
      totalGoodsForeign += lineTotalForeign;
      totalGoodsVND += lineTotalVND;
      totalVATForeign += vatAmountForeign;
      totalVATVND += vatAmountVND;

      return {
        ...item,
        unitPriceVND: item.unitPriceForeign * rate,
        totalForeign: lineTotalForeign + vatAmountForeign,
        totalVND: lineTotalVND + vatAmountVND
      };
    });

    const totalBeforeShippingVND = totalGoodsVND + totalVATVND;
    const intlShippingVND = (data.intlShippingFeeForeign || 0) * rate;
    const finalTotalVND = totalBeforeShippingVND + intlShippingVND + (data.domesticShippingFeeVND || 0) + (data.otherFeesVND || 0);

    return {
      ...data,
      items,
      totalGoodsForeign,
      totalGoodsVND,
      totalVATForeign,
      totalVATVND,
      intlShippingFeeVND: intlShippingVND,
      totalBeforeShippingVND,
      finalTotalVND,
      avgPriceVND: items.length > 0 ? finalTotalVND / items.reduce((sum, it) => sum + it.quantity, 0) : 0
    };
  };

  const handleFieldChange = (field: string, value: any) => {
    let newData = { ...formData, [field]: value };
    
    if (field === 'warrantyStartDate' || field === 'warrantyMonths') {
      const start = parseISO(newData.warrantyStartDate || format(new Date(), 'yyyy-MM-dd'));
      const months = parseInt(newData.warrantyMonths as any || 0);
      newData.warrantyEndDate = format(addMonths(start, months), 'yyyy-MM-dd');
    }

    if (['exchangeRate', 'intlShippingFeeForeign', 'domesticShippingFeeVND', 'otherFeesVND'].includes(field)) {
       newData = calculateTotals(newData);
    }
    setFormData(newData);
  };

  const addItem = () => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      sku: '',
      quantity: 1,
      unit: 'Cái',
      specs: '',
      unitPriceForeign: 0,
      unitPriceVND: 0,
      vatRate: 10,
      totalForeign: 0,
      totalVND: 0,
      origin: formData.originCountry || ''
    };
    const newData = calculateTotals({ ...formData, items: [...(formData.items || []), newItem] });
    setFormData(newData);
  };

  const removeItem = (id: string) => {
    const newData = calculateTotals({ ...formData, items: (formData.items || []).filter(i => i.id !== id) });
    setFormData(newData);
  };

  const updateItem = (id: string, field: string, value: any) => {
    const items = (formData.items || []).map(item => {
      if (item.id === id) return { ...item, [field]: value };
      return item;
    });
    setFormData(calculateTotals({ ...formData, items }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (upload) => {
        const newAttachment: FileAttachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type || 'unknown',
          size: file.size,
          base64: upload.target?.result as string,
          uploadDate: new Date().toISOString()
        };
        setFormData({ ...formData, attachments: [...(formData.attachments || []), newAttachment] });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (id: string) => {
    setFormData({ ...formData, attachments: (formData.attachments || []).filter(a => a.id !== id) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name || !formData.seller || (formData.items || []).length === 0) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc và ít nhất 1 mặt hàng.');
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 w-full max-w-6xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        <div className="p-6 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
              <Truck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{editingContract ? 'Chỉnh sửa' : 'Thêm'} Hợp đồng Nhập khẩu</h2>
              <p className="text-xs text-slate-400">{formData.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-xl transition-all"><X size={20} /></button>
        </div>

        <div className="flex bg-slate-800/30 p-2 gap-2 border-b border-slate-800">
          {[
            { id: 1, label: 'Thông tin chung', icon: Info },
            { id: 2, label: 'Danh mục hàng hóa', icon: ListIcon },
            { id: 3, label: 'Chi phí & Tổng hợp', icon: Coins },
            { id: 4, label: 'Tệp đính kèm', icon: Upload }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-700'}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <form className="space-y-8">
            {activeTab === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-full mb-2">
                   <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 uppercase tracking-widest"><Info size={16}/> Thông tin cơ bản</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Số Hợp đồng *</label>
                  <input 
                    type="text" 
                    value={formData.id} 
                    onChange={e => handleFieldChange('id', e.target.value)} 
                    placeholder="VD: HĐ-NK-2024-0001"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    required 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Tên hợp đồng / dự án *</label>
                  <input type="text" value={formData.name} onChange={e => handleFieldChange('name', e.target.value)} placeholder="Nhập tên dự án" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Bên bán (Nhà cung cấp) *</label>
                  <input type="text" value={formData.seller} onChange={e => handleFieldChange('seller', e.target.value)} placeholder="Tên công ty nước ngoài" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Quốc gia xuất xứ</label>
                  <input type="text" value={formData.originCountry} onChange={e => handleFieldChange('originCountry', e.target.value)} placeholder="VD: Đức, Nhật, Mỹ..." className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Ngày ký hợp đồng</label>
                  <input type="date" value={formData.signDate} onChange={e => handleFieldChange('signDate', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Ngày nhập hàng dự kiến</label>
                  <input type="date" value={formData.expectedImportDate} onChange={e => handleFieldChange('expectedImportDate', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Đồng tiền thanh toán</label>
                  <select value={formData.currency} onChange={e => handleFieldChange('currency', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm outline-none">
                    <option value="USD">USD - Đô la Mỹ</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="CNY">CNY - Nhân dân tệ</option>
                    <option value="JPY">JPY - Yên Nhật</option>
                    <option value="Khác">Ngoại tệ khác</option>
                  </select>
                </div>
                <div className="space-y-2 text-emerald-500">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Tỷ giá quy đổi (VNĐ)</label>
                  <input type="number" value={formData.exchangeRate} onChange={e => handleFieldChange('exchangeRate', parseFloat(e.target.value))} className="w-full bg-slate-800 border border-emerald-500/30 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>

                <div className="col-span-full mt-4 mb-2">
                   <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2 uppercase tracking-widest"><Truck size={16}/> Giao nhận & Bảo hành</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Điều kiện Incoterms</label>
                  <select value={formData.incoterms} onChange={e => handleFieldChange('incoterms', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm outline-none">
                    <option value="FOB">FOB</option>
                    <option value="CIF">CIF</option>
                    <option value="CFR">CFR</option>
                    <option value="EXW">EXW</option>
                    <option value="DDP">DDP</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 ml-1">Phương thức thanh toán</label>
                  <select value={formData.paymentMethod} onChange={e => handleFieldChange('paymentMethod', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm outline-none">
                    <option value="T/T">Chuyển khoản (T/T)</option>
                    <option value="L/C">Tín dụng thư (L/C)</option>
                    <option value="D/P">D/P</option>
                    <option value="D/A">D/A</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="space-y-2">
                   <div className="flex gap-2 items-center mb-2">
                      <input type="checkbox" id="hasWar" checked={formData.hasWarranty} onChange={e => handleFieldChange('hasWarranty', e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
                      <label htmlFor="hasWar" className="text-[10px] font-black uppercase text-slate-100 italic">Có bảo hành</label>
                   </div>
                   {formData.hasWarranty && (
                      <div className="grid grid-cols-2 gap-2">
                         <input type="number" value={formData.warrantyMonths} onChange={e => handleFieldChange('warrantyMonths', e.target.value)} placeholder="Số tháng" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs outline-none" />
                         <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl px-3 flex items-center justify-center font-bold text-[10px] uppercase">
                            Hết hạn: {format(parseISO(formData.warrantyEndDate || format(new Date(), 'yyyy-MM-dd')), 'dd/MM/yyyy')}
                         </div>
                      </div>
                   )}
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest">Danh mục hàng hóa chi tiết</h3>
                  <button type="button" onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all"><Plus size={16} /> Thêm dòng hàng</button>
                </div>
                <div className="overflow-x-auto border border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-slate-400 uppercase text-[10px] font-black">
                        <th className="p-3 w-10">STT</th>
                        <th className="p-3 min-w-[200px]">Hàng hóa / Model</th>
                        <th className="p-3 w-20">SL</th>
                        <th className="p-3 w-20">ĐVT</th>
                        <th className="p-3">Thông số</th>
                        <th className="p-3 w-32">Đơn giá ({formData.currency})</th>
                        <th className="p-3 w-32">Đơn giá (VNĐ)</th>
                        <th className="p-3 w-20">Thuế</th>
                        <th className="p-3 text-right bg-blue-500/10 text-blue-500">Thành tiền (VNĐ)</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {(formData.items || []).map((item, idx) => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 text-slate-500 font-bold">{idx + 1}</td>
                          <td className="p-3 space-y-1">
                            <input type="text" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Tên hàng" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 outline-none focus:border-blue-500" />
                            <input type="text" value={item.sku} onChange={e => updateItem(item.id, 'sku', e.target.value)} placeholder="Mã/Model" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-2 text-[10px] outline-none" />
                          </td>
                          <td className="p-3">
                            <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 outline-none" />
                          </td>
                          <td className="p-3">
                            <input type="text" value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 outline-none" />
                          </td>
                          <td className="p-3">
                            <textarea value={item.specs} onChange={e => updateItem(item.id, 'specs', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 h-16 resize-none outline-none text-[10px]" placeholder="Thông số..."></textarea>
                          </td>
                          <td className="p-3 font-bold text-amber-500">
                             <input type="number" value={item.unitPriceForeign} onChange={e => updateItem(item.id, 'unitPriceForeign', parseFloat(e.target.value))} className="w-full bg-slate-800 border border-amber-500/30 rounded-lg p-2 outline-none mb-1 text-xs" />
                          </td>
                          <td className="p-3">
                             <div className="text-[10px] font-black text-slate-500 px-2 truncate leading-tight uppercase">
                                {new Intl.NumberFormat('vi-VN').format(item.unitPriceVND || 0)}
                             </div>
                          </td>
                          <td className="p-3">
                            <select value={item.vatRate} onChange={e => updateItem(item.id, 'vatRate', parseInt(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 outline-none">
                              {[0, 5, 8, 10].map(v => <option key={v} value={v}>{v}%</option>)}
                            </select>
                          </td>
                          <td className="p-3 text-right font-black bg-blue-500/5 text-blue-400">
                             {new Intl.NumberFormat('vi-VN').format(item.totalVND || 0)}
                          </td>
                          <td className="p-3 text-center">
                            <button type="button" onClick={() => removeItem(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><X size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                       <tr className="bg-slate-800 font-bold border-t border-slate-700">
                          <td colSpan={8} className="p-3 text-right uppercase text-xs tracking-widest text-slate-500">Cộng tiền hàng (VNĐ):</td>
                          <td className="p-3 text-right text-blue-500 text-sm underline underline-offset-4 decoration-2">
                             {new Intl.NumberFormat('vi-VN').format(formData.totalGoodsVND || 0)}
                          </td>
                          <td></td>
                       </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest border-b border-slate-800 pb-2">Chi phí vận chuyển & logistic</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500">Phí VC Quốc tế ({formData.currency})</label>
                      <input type="number" value={formData.intlShippingFeeForeign} onChange={e => handleFieldChange('intlShippingFeeForeign', parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-2 flex flex-col justify-end pb-3 text-xs font-bold text-slate-500">
                       = {new Intl.NumberFormat('vi-VN').format(formData.intlShippingFeeVND || 0)} VNĐ
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500">Phí VC Nội địa (VNĐ)</label>
                      <input type="number" value={formData.domesticShippingFeeVND} onChange={e => handleFieldChange('domesticShippingFeeVND', parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500">Chi phí khác (Hải quan, kho...)</label>
                      <input type="number" value={formData.otherFeesVND} onChange={e => handleFieldChange('otherFeesVND', parseFloat(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="col-span-full pt-4 space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500">Ghi chú nội bộ</label>
                       <textarea value={formData.internalNote} onChange={e => handleFieldChange('internalNote', e.target.value)} rows={4} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm outline-none resize-none"></textarea>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-800 pb-2 text-right">Bảng tổng hợp chi phí nhập</h3>
                  <div className="bg-slate-800/50 border-2 border-slate-800 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 italic">Tổng tiền hàng (trước thuế):</span>
                      <span className="font-bold flex flex-col items-end">
                        <span className="text-slate-100">{new Intl.NumberFormat('vi-VN').format(formData.totalGoodsVND || 0)} VNĐ</span>
                        <span className="text-[10px] text-slate-600">{formData.currency} {new Intl.NumberFormat('en-US').format(formData.totalGoodsForeign || 0)}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 italic">Thuế VAT nhập khẩu:</span>
                      <span className="font-bold text-slate-100">{new Intl.NumberFormat('vi-VN').format(formData.totalVATVND || 0)} VNĐ</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-black text-blue-400 pb-2 border-b border-slate-700">
                      <span>Cộng giá nhập hàng hóa:</span>
                      <span>{new Intl.NumberFormat('vi-VN').format(formData.totalBeforeShippingVND || 0)} VNĐ</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-amber-500/80">
                      <span>Tổng phí vận chuyển:</span>
                      <span>{new Intl.NumberFormat('vi-VN').format((formData.intlShippingFeeVND || 0) + (formData.domesticShippingFeeVND || 0) + (formData.otherFeesVND || 0))} VNĐ</span>
                    </div>
                    <div className="pt-4 mt-4 border-t-2 border-slate-700">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-sm font-black text-slate-100 uppercase tracking-tighter">G. TỔNG GIÁ NHẬP CUỐI CÙNG</span>
                         <span className="text-2xl font-black text-red-500 underline decoration-red-900 decoration-4 underline-offset-8">
                            {new Intl.NumberFormat('vi-VN').format(formData.finalTotalVND || 0)}
                         </span>
                      </div>
                      <p className="text-[10px] text-right text-slate-400 font-bold italic leading-tight mt-4">
                         Bằng chữ: {numberToTextVietnamese(formData.finalTotalVND || 0)}
                      </p>
                    </div>
                    <div className="bg-slate-950/50 p-4 rounded-2xl flex justify-between items-center border border-slate-800">
                       <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-1"><Package size={14}/> Giá nhập bình quân/Đơn vị:</span>
                       <span className="text-sm font-black text-emerald-500">
                          {new Intl.NumberFormat('vi-VN').format(formData.avgPriceVND || 0)} VNĐ
                       </span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Trạng thái hiện tại</h3>
                    <div className="grid grid-cols-1 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500">Cập nhật trạng thái HĐ *</label>
                          <select value={formData.status} onChange={e => handleFieldChange('status', e.target.value)} className="w-full bg-slate-800 border border-blue-500/30 rounded-xl p-3 text-sm outline-none font-bold text-blue-400">
                             <option value="MỚI_TẠO">🆕 Mới tạo</option>
                             <option value="ĐANG_THỰC_HIỆN">🏗️ Đang thực hiện</option>
                             <option value="HÀNG_ĐÃ_VỀ">📦 Hàng đã về</option>
                             <option value="HOÀN_THÀNH">✅ Hoàn thành</option>
                             <option value="TẠM_DỪNG">⏸️ Tạm dừng</option>
                             <option value="HỦY">❌ Hủy hợp đồng</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500">Tình trạng thanh toán</label>
                          <select value={formData.paymentStatus} onChange={e => handleFieldChange('paymentStatus', e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm outline-none">
                             <option value="CHƯA_THANH_TOÁN">Sơ đồ: Chưa thanh toán</option>
                             <option value="THANH_TOÁN_MỘT_PHẦN">Sơ đồ: Thanh toán một phần</option>
                             <option value="ĐÃ_THANH_TOÁN_ĐỦ">Sơ đồ: Đã thanh toán đủ</option>
                          </select>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div className="space-y-8">
                <div className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-3xl p-12 text-center relative group hover:border-blue-500/50 transition-all">
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 group-hover:opacity-10 transition-opacity">
                      <FileCheck size={200} />
                   </div>
                   <div className="relative z-10">
                      <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500 mx-auto mb-6 group-hover:scale-110 transition-transform">
                         <Upload size={32} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Tải hồ sơ đính kèm</h3>
                      <p className="text-slate-500 text-sm mb-8 leading-relaxed">Hợp đồng gốc, Commercial Invoice, Packing List, C/O... <br/> Hỗ trợ PDF, DOCX, XLSX, JPG, PNG. Dung lượng tối đa 50MB/file.</p>
                      <label className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-xl shadow-blue-900/20 cursor-pointer inline-flex items-center gap-3 transition-all">
                         <Plus size={20} /> CHỌN TỆP TỪ MÁY TÍNH
                         <input type="file" className="hidden" onChange={handleFileUpload} />
                      </label>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Danh sách tệp đã tải lên ({formData.attachments?.length || 0})</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.attachments?.map((file: FileAttachment) => (
                         <div key={file.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-blue-400">
                                  <FileText size={20} />
                               </div>
                               <div>
                                  <p className="text-sm font-bold truncate max-w-[200px]">{file.name}</p>
                                  <p className="text-[10px] text-slate-500 uppercase font-black">{(file.size / 1024 / 1024).toFixed(2)} MB • {format(parseISO(file.uploadDate), 'dd/MM/yyyy')}</p>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <a href={file.base64} download={file.name} className="p-2 bg-slate-700 hover:bg-blue-600 rounded-lg text-slate-400 hover:text-white transition-all"><Download size={16}/></a>
                               <button onClick={() => removeAttachment(file.id)} className="p-2 bg-slate-700 hover:bg-red-600 rounded-lg text-slate-400 hover:text-white transition-all"><Trash2 size={16}/></button>
                            </div>
                         </div>
                      ))}
                      {(!formData.attachments || formData.attachments.length === 0) && (
                         <div className="col-span-full p-8 text-center text-slate-600 bg-slate-900/30 border border-slate-800 rounded-2xl italic text-xs tracking-tighter">
                            Chưa có tệp hồ sơ nào được tải lên cho hợp đồng này.
                         </div>
                      )}
                   </div>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-6 bg-slate-800/50 border-t border-slate-700 flex justify-between items-center">
            <div className="text-xs font-bold text-slate-500 italic">
               * Các trường có đánh dấu sao là bắt buộc. ID hợp đồng được sinh tự động.
            </div>
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-8 py-3 border border-slate-700 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-all uppercase text-[10px] tracking-widest active:scale-95"
              >
                Hủy bỏ
              </button>
              <button 
                type="button" 
                onClick={handleSubmit}
                className="px-10 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all shadow-xl shadow-blue-900/20 uppercase text-[10px] tracking-widest flex items-center gap-3 active:scale-95"
              >
                <CheckCircle size={18} /> LƯU HỢP ĐỒNG
              </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};







