import { NextResponse } from 'next/server';

export async function GET() {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AMSIRS Premium Concept (V2)</title>
    <!-- Poppins Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Poppins', 'sans-serif'],
                    },
                    colors: {
                        cavite: {
                            maroon: '#7A191B',
                            hover: '#902022',
                            light: '#F8E8E8'
                        },
                        ui: {
                            bg: '#F3F5F8',
                            card: '#FFFFFF',
                            text: '#2D3748',
                            muted: '#A0AEC0'
                        }
                    },
                    boxShadow: {
                        'soft': '0 10px 40px -10px rgba(0,0,0,0.05)',
                        'colored': '0 10px 25px -5px rgba(122, 25, 27, 0.3)'
                    }
                }
            }
        }
    </script>
    <!-- Feather Icons -->
    <script src="https://unpkg.com/feather-icons"></script>
    <style>
        body {
            background-color: #F3F5F8;
            color: #2D3748;
        }
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }
        
        /* Premium Gradients */
        .grad-primary {
            background: linear-gradient(135deg, #7A191B 0%, #A02023 100%);
        }
        .grad-blue {
            background: linear-gradient(135deg, #4299E1 0%, #3182CE 100%);
        }
        .grad-orange {
            background: linear-gradient(135deg, #ED8936 0%, #DD6B20 100%);
        }
    </style>
</head>
<body class="flex h-screen overflow-hidden antialiased">

    <!-- Sidebar (Style 2 Inspiration: Solid block with rounded selection) -->
    <aside class="w-24 lg:w-64 bg-white shadow-soft flex flex-col justify-between rounded-r-[32px] my-4 ml-4 z-20">
        <div>
            <!-- Logo Area -->
            <div class="h-24 flex items-center justify-center lg:justify-start lg:px-8 border-b border-gray-100">
                <div class="w-10 h-10 bg-cavite-maroon rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-colored">
                    A
                </div>
                <span class="hidden lg:block ml-3 font-bold text-xl tracking-tight text-gray-800">AMSIRS</span>
            </div>

            <!-- Nav Links -->
            <nav class="mt-8 px-4 flex flex-col gap-2">
                <a href="#" class="flex items-center gap-4 px-4 py-3 bg-cavite-light text-cavite-maroon rounded-2xl transition-all font-semibold">
                    <i data-feather="grid" class="w-5 h-5"></i>
                    <span class="hidden lg:block">Dashboard</span>
                </a>
                
                <a href="#" class="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-2xl transition-all font-medium">
                    <i data-feather="users" class="w-5 h-5"></i>
                    <span class="hidden lg:block">Student Body</span>
                </a>
                
                <a href="#" class="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-2xl transition-all font-medium">
                    <i data-feather="shield" class="w-5 h-5"></i>
                    <span class="hidden lg:block">Access Logs</span>
                </a>

                <a href="#" class="flex items-center gap-4 px-4 py-3 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-2xl transition-all font-medium">
                    <i data-feather="alert-triangle" class="w-5 h-5"></i>
                    <span class="hidden lg:block">Incidents</span>
                </a>
            </nav>
        </div>

        <div class="p-4">
            <div class="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                <img src="https://i.pravatar.cc/150?img=11" alt="Profile" class="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                <div class="hidden lg:block">
                    <p class="text-sm font-bold text-gray-800">Admin User</p>
                    <p class="text-xs text-gray-400 font-medium">System Root</p>
                </div>
            </div>
        </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 h-full overflow-y-auto hide-scrollbar p-6 lg:p-10">
        
        <!-- Topbar -->
        <header class="flex items-center justify-between mb-10">
            <div>
                <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Overview</h1>
                <p class="text-gray-500 font-medium mt-1">Welcome back, let's manage the campus.</p>
            </div>
            
            <div class="flex items-center gap-4">
                <div class="relative hidden md:block">
                    <i data-feather="search" class="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input type="text" placeholder="Search anything..." class="bg-white border-none shadow-soft rounded-2xl pl-12 pr-6 py-3 w-64 focus:outline-none focus:ring-2 focus:ring-cavite-maroon/20 font-medium text-sm placeholder:text-gray-400 transition-all">
                </div>
                <button class="w-12 h-12 bg-white rounded-2xl shadow-soft flex items-center justify-center text-gray-400 hover:text-cavite-maroon transition-colors relative">
                    <i data-feather="bell" class="w-5 h-5"></i>
                    <span class="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>

        <!-- Stat Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            
            <!-- Primary Card -->
            <div class="grad-primary rounded-3xl p-6 text-white shadow-colored relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <i data-feather="users" class="w-6 h-6 text-white"></i>
                    </div>
                    <p class="font-semibold text-white/80">Total Students</p>
                </div>
                <h2 class="text-4xl font-bold">1,284</h2>
                <div class="mt-4 text-sm font-medium text-white/70 flex items-center gap-1">
                    <i data-feather="trending-up" class="w-4 h-4"></i>
                    +12 this month
                </div>
            </div>

            <!-- Secondary Card -->
            <div class="grad-blue rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden group hover:-translate-y-1 transition-transform">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <i data-feather="log-in" class="w-6 h-6 text-white"></i>
                    </div>
                    <p class="font-semibold text-white/80">Today's Entries</p>
                </div>
                <h2 class="text-4xl font-bold">842</h2>
                <div class="mt-4 text-sm font-medium text-white/70 flex items-center gap-1">
                    <i data-feather="clock" class="w-4 h-4"></i>
                    As of 09:30 AM
                </div>
            </div>

            <!-- Tertiary Card -->
            <div class="bg-white rounded-3xl p-6 text-gray-800 shadow-soft group hover:-translate-y-1 transition-transform border border-gray-100">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                        <i data-feather="alert-circle" class="w-6 h-6 text-orange-500"></i>
                    </div>
                    <p class="font-semibold text-gray-500">Active Incidents</p>
                </div>
                <h2 class="text-4xl font-bold">14</h2>
                <div class="mt-4 text-sm font-medium text-orange-500 flex items-center gap-1">
                    Requires attention
                </div>
            </div>

            <!-- Quaternary Card -->
            <div class="bg-white rounded-3xl p-6 text-gray-800 shadow-soft group hover:-translate-y-1 transition-transform border border-gray-100">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                        <i data-feather="check-circle" class="w-6 h-6 text-green-500"></i>
                    </div>
                    <p class="font-semibold text-gray-500">Resolved Cases</p>
                </div>
                <h2 class="text-4xl font-bold">128</h2>
                <div class="mt-4 text-sm font-medium text-green-500 flex items-center gap-1">
                    <i data-feather="trending-up" class="w-4 h-4"></i>
                    +5 from last week
                </div>
            </div>

        </div>

        <!-- Middle Section: Analytics & Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <!-- Left Wide Column: Table -->
            <div class="lg:col-span-2 space-y-8">
                
                <div class="bg-white rounded-3xl p-8 shadow-soft border border-gray-100">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-800">Recent Campus Access</h3>
                        <button class="text-sm font-semibold text-cavite-maroon hover:text-cavite-hover flex items-center gap-1">
                            View All <i data-feather="arrow-right" class="w-4 h-4"></i>
                        </button>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th class="pb-4 pt-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                                    <th class="pb-4 pt-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                                    <th class="pb-4 pt-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th class="pb-4 pt-2 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Match</th>
                                </tr>
                            </thead>
                            <tbody class="text-sm divide-y divide-gray-50">
                                <tr class="hover:bg-gray-50 transition-colors">
                                    <td class="py-4">
                                        <div class="flex items-center gap-3">
                                            <img src="https://i.pravatar.cc/150?img=32" class="w-10 h-10 rounded-xl object-cover" />
                                            <div>
                                                <p class="font-bold text-gray-800">Jane Cooper</p>
                                                <p class="text-xs text-gray-500">ID: 2023-0142</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="py-4 text-gray-600 font-medium">09:14 AM</td>
                                    <td class="py-4">
                                        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold">ENTRY</span>
                                    </td>
                                    <td class="py-4 text-right font-bold text-gray-800">98%</td>
                                </tr>
                                <tr class="hover:bg-gray-50 transition-colors">
                                    <td class="py-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold">WA</div>
                                            <div>
                                                <p class="font-bold text-gray-800">Wade Warren</p>
                                                <p class="text-xs text-gray-500">ID: 2023-0891</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="py-4 text-gray-600 font-medium">09:10 AM</td>
                                    <td class="py-4">
                                        <span class="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold">EXIT</span>
                                    </td>
                                    <td class="py-4 text-right font-bold text-gray-800">95%</td>
                                </tr>
                                <tr class="hover:bg-gray-50 transition-colors">
                                    <td class="py-4">
                                        <div class="flex items-center gap-3">
                                            <img src="https://i.pravatar.cc/150?img=12" class="w-10 h-10 rounded-xl object-cover" />
                                            <div>
                                                <p class="font-bold text-gray-800">Esther Howard</p>
                                                <p class="text-xs text-gray-500">ID: 2023-0441</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="py-4 text-gray-600 font-medium">09:05 AM</td>
                                    <td class="py-4">
                                        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-bold">ENTRY</span>
                                    </td>
                                    <td class="py-4 text-right font-bold text-gray-800">99%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <!-- Right Column: Quick Actions & Summary -->
            <div class="space-y-6">
                
                <!-- Action Card -->
                <div class="bg-white rounded-3xl p-8 shadow-soft border border-gray-100 relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-cavite-light rounded-full -mr-10 -mt-10 opacity-50"></div>
                    <h3 class="text-xl font-bold text-gray-800 relative z-10">Quick Actions</h3>
                    <p class="text-sm text-gray-500 mt-1 mb-6 relative z-10">Frequent administrative tasks</p>
                    
                    <div class="space-y-3 relative z-10">
                        <button class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-cavite-light hover:text-cavite-maroon rounded-2xl transition-all group border border-transparent hover:border-cavite-maroon/20">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:text-cavite-maroon">
                                    <i data-feather="user-plus" class="w-5 h-5"></i>
                                </div>
                                <span class="font-semibold text-gray-700 group-hover:text-cavite-maroon">Register Staff</span>
                            </div>
                            <i data-feather="chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-cavite-maroon"></i>
                        </button>

                        <button class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 rounded-2xl transition-all group border border-transparent hover:border-orange-200">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:text-orange-600">
                                    <i data-feather="file-text" class="w-5 h-5"></i>
                                </div>
                                <span class="font-semibold text-gray-700 group-hover:text-orange-600">Log Incident</span>
                            </div>
                            <i data-feather="chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-orange-600"></i>
                        </button>
                    </div>
                </div>

                <!-- Recent Alerts -->
                <div class="bg-white rounded-3xl p-8 shadow-soft border border-gray-100">
                    <h3 class="text-xl font-bold text-gray-800 mb-6">Pending Review</h3>
                    
                    <div class="space-y-4">
                        <div class="flex gap-4">
                            <div class="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                                <i data-feather="alert-triangle" class="w-5 h-5 text-orange-600"></i>
                            </div>
                            <div>
                                <p class="font-bold text-sm text-gray-800">Unrecognized Face Detected</p>
                                <p class="text-xs text-gray-500 mt-1">Main Gate Camera 2 &bull; 10 mins ago</p>
                            </div>
                        </div>
                        
                        <div class="flex gap-4">
                            <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <i data-feather="info" class="w-5 h-5 text-blue-600"></i>
                            </div>
                            <div>
                                <p class="font-bold text-sm text-gray-800">System Update Ready</p>
                                <p class="text-xs text-gray-500 mt-1">Version 2.4.1 available &bull; 1 hr ago</p>
                            </div>
                        </div>
                    </div>
                    
                    <button class="w-full mt-6 py-3 border-2 border-gray-100 text-gray-500 font-semibold rounded-2xl hover:bg-gray-50 hover:text-gray-800 transition-all text-sm">
                        View All Alerts
                    </button>
                </div>

            </div>
        </div>
    </main>

    <script>
        feather.replace();
    </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
