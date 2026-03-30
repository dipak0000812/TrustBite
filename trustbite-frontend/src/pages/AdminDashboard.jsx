import React from 'react';
import { ShieldCheck, Users, ClipboardList, CheckCircle, XCircle, MoreVertical, Search, Filter } from 'lucide-react';

const AdminDashboard = () => {
  // Dummy Admin Data
  const pendingApprovals = [
    { id: 1, name: "Sunrise Mess", owner: "Amit K.", date: "12 Oct 2024", status: "Pending" },
    { id: 2, name: "City Tiffin", owner: "Priya S.", date: "11 Oct 2024", status: "Pending" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-neutral-900 mb-2">Admin Dashboard</h1>
          <p className="text-neutral-500 font-medium">Manage messes, users, and assign hygiene scores.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm">
            <div className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center mb-6">
              <ClipboardList className="w-6 h-6 text-brand" />
            </div>
            <div className="text-3xl font-black text-neutral-900 mb-1">42</div>
            <div className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Active Messes</div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm">
            <div className="w-12 h-12 bg-trust-light rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-trust" />
            </div>
            <div className="text-3xl font-black text-neutral-900 mb-1">1,240</div>
            <div className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Total Users</div>
          </div>
          <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm">
            <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-black text-neutral-900 mb-1">15</div>
            <div className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Pending Audits</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Table Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[40px] border border-neutral-100 shadow-premium overflow-hidden">
               <div className="p-8 border-b border-neutral-50 flex justify-between items-center">
                 <h2 className="text-xl font-bold text-neutral-900">Pending Approvals</h2>
                 <div className="flex gap-2">
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                     <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-neutral-50 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-neutral-100" />
                   </div>
                   <button className="p-2.5 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
                     <Filter className="w-4 h-4 text-neutral-600" />
                   </button>
                 </div>
               </div>
               
               <table className="w-full text-left">
                 <thead className="bg-neutral-50/50">
                   <tr>
                     <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Mess Name</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Owner</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Applied Date</th>
                     <th className="px-8 py-5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-neutral-50">
                   {pendingApprovals.map(app => (
                     <tr key={app.id} className="hover:bg-neutral-50/30 transition-colors">
                       <td className="px-8 py-6">
                         <div className="font-bold text-neutral-900">{app.name}</div>
                       </td>
                       <td className="px-8 py-6 text-sm text-neutral-500 font-medium">{app.owner}</td>
                       <td className="px-8 py-6 text-sm text-neutral-500 font-medium">{app.date}</td>
                       <td className="px-8 py-6">
                         <div className="flex justify-end gap-2">
                            <button title="Approve" className="p-2 text-trust hover:bg-trust-light rounded-lg transition-colors">
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button title="Reject" className="p-2 text-brand hover:bg-brand-light rounded-lg transition-colors">
                              <XCircle className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-neutral-400">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               
               <div className="p-6 bg-neutral-50/50 text-center">
                 <button className="text-sm font-bold text-neutral-400 hover:text-neutral-900 transition-all">View All Requests</button>
               </div>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="space-y-8">
            <div className="bg-neutral-900 text-white p-10 rounded-[40px] shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-brand/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
               <h3 className="text-xl font-bold mb-8">System Audit</h3>
               <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-trust mt-2 shadow-[0_0_10px_#00B67A]"></div>
                    <div>
                      <p className="font-bold text-sm">Server Status: Online</p>
                      <p className="text-xs text-neutral-400">Uptime: 99.9%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-brand mt-2 shadow-[0_0_10px_#FF3008]"></div>
                    <div>
                      <p className="font-bold text-sm">DB Latency: Normal</p>
                      <p className="text-xs text-neutral-400">Response: 45ms</p>
                    </div>
                  </div>
               </div>
               
               <button className="w-full bg-white/10 border border-white/20 text-white py-4 rounded-2xl font-bold mt-10 hover:bg-white/20 transition-all text-sm">
                 Run Global Audit
               </button>
            </div>
            
            <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm text-center">
               <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <ShieldCheck className="w-8 h-8 text-neutral-400" />
               </div>
               <h3 className="font-black text-neutral-900 mb-2">Assign Hygiene</h3>
               <p className="text-xs text-neutral-500 mb-6 font-medium">Bulk update hygiene scores for verified messes.</p>
               <button className="text-brand font-bold py-2 px-4 rounded-xl border border-brand bg-brand-light text-sm hover:bg-brand hover:text-white transition-all">
                 Open Batch Editor
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
