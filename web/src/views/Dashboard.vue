<template>
  <div class="overflow-y-scroll h-[calc(100vh-100px)]">
    <!-- Loading State -->
    <div v-if="dashboardStore.loading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <svg aria-hidden="true" class="w-12 h-12 mr-2 text-gray-200 animate-spin fill-blue-600 mx-auto mb-4" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <p class="text-gray-600">กำลังโหลดข้อมูล Dashboard...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="dashboardStore.error" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="text-red-500 font-semibold text-xl mb-4">เกิดข้อผิดพลาด</div>
        <p class="text-gray-600 mb-4">{{ dashboardStore.error }}</p>
        <button 
          @click="refreshDashboard"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="container mx-auto px-2 py-1">
      <!-- Header -->
      <div class="mb-1">
        <div class="flex justify-between items-start">
          <div> 
            <div class="mt-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    :class="dashboardStore.isAdminView ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                {{ dashboardStore.getFilterText }}
              </span>
            </div>
          </div>
          
          <!-- Admin Toggle Button -->
          <div v-if="authStore.userRole === 'admin'" class="flex items-center space-x-2">
            <button
              @click="toggleView"
              :disabled="dashboardStore.loading"
              class="inline-flex cursor-pointer items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
              {{ dashboardStore.isAdminView ? 'ดูข้อมูลของฉัน' : 'ดูข้อมูลทั้งหมด' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Section A: Overview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 mb-1">
        <!-- Total KPIs -->
        <div class="max-w-sm p-3 bg-white border border-gray-200 rounded shadow-sm hover:shadow transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="text-xs font-medium text-gray-500">
                KPI {{ dashboardStore.isAdminView ? 'ทั้งหมด' : 'ของฉัน' }}
              </h5>
              <p class="text-lg font-bold text-gray-900">{{ dashboardStore.overview.total_kpis }}</p>
            </div>
            <div class="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- On Track -->
        <div class="max-w-sm p-3 bg-white border border-gray-200 rounded shadow-sm hover:shadow transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="text-xs font-medium text-gray-500">
                On Track {{ dashboardStore.isAdminView ? '(ทั้งหมด)' : '(ของฉัน)' }}
              </h5>
              <p class="text-lg font-bold text-green-600">{{ dashboardStore.overview.on_track }}</p>
            </div>
            <div class="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
              <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- At Risk -->
        <div class="max-w-sm p-3 bg-white border border-gray-200 rounded shadow-sm hover:shadow transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="text-xs font-medium text-gray-500">
                At Risk {{ dashboardStore.isAdminView ? '(ทั้งหมด)' : '(ของฉัน)' }}
              </h5>
              <p class="text-lg font-bold text-yellow-600">{{ dashboardStore.overview.at_risk }}</p>
            </div>
            <div class="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
              <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Off Track -->
        <div class="max-w-sm p-3 bg-white border border-gray-200 rounded shadow-sm hover:shadow transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <h5 class="text-xs font-medium text-gray-500">
                Off Track {{ dashboardStore.isAdminView ? '(ทั้งหมด)' : '(ของฉัน)' }}
              </h5>
              <p class="text-lg font-bold text-red-600">{{ dashboardStore.overview.off_track }}</p>
            </div>
            <div class="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
              <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Section B & C: Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-1 mb-1">
        <!-- Status Distribution Donut Chart -->
        <div class="bg-white border border-gray-200 rounded shadow-sm p-3">
          <div class="flex justify-between items-center mb-2">
            <h5 class="text-lg font-bold tracking-tight text-gray-900">KPI Status Distribution</h5>
            <div class="text-xs text-gray-500">
              รวม {{ dashboardStore.totalKPIsFromStatus }} KPI
            </div>
          </div>
          <div v-if="dashboardStore.statusChartData.length > 0">
            <ApexChart
              type="donut"
              :options="donutChartOptions"
              :series="donutChartSeries"
              height="250"
            ></ApexChart>
            
            <!-- Status Details -->
            <div class="mt-2 grid grid-cols-3 gap-2">
              <div v-for="(count, status) in dashboardStore.statusPercentages" :key="status" class="text-center">
                <div class="text-sm font-bold" :class="getStatusTextColor(status)">
                  {{ count }}%
                </div>
                <div class="text-xs text-gray-600">{{ status }}</div>
              </div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-48 text-gray-500">
            ไม่มีข้อมูล
          </div>
        </div>

        <!-- KPI Trends Line Chart -->
        <div class="bg-white border border-gray-200 rounded shadow-sm p-3">
          <div class="flex justify-between items-center mb-2">
            <h5 class="text-lg font-bold tracking-tight text-gray-900">KPI Trends Over Time</h5>
            <div class="text-xs text-gray-500">
              {{ dashboardStore.trendsPeriod }} • {{ dashboardStore.trendsGroupBy }}
            </div>
          </div>
          <div v-if="dashboardStore.trendsChartData.categories.length > 0">
            <ApexChart
              type="line"
              :options="lineChartOptions"
              :series="dashboardStore.trendsChartData.series"
              height="250"
            ></ApexChart>
            
            <!-- Trends Info -->
            <div class="mt-2 text-xs text-gray-500">
              <div v-if="Object.keys(dashboardStore.trendsFilters).length > 0">
                Filters: 
                <span v-for="(value, key) in dashboardStore.trendsFilters" :key="key" class="ml-1">
                  {{ key }}: {{ value }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="flex items-center justify-center h-48 text-gray-500">
            ไม่มีข้อมูล
          </div>
        </div>
      </div>

      <!-- Section D & E: Tables Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-1 mb-1">
        <!-- Top Performing KPIs -->
        <div class="bg-white border border-gray-200 rounded shadow-sm">
          <div class="px-3 py-2 border-b border-gray-200">
            <h5 class="text-base font-bold tracking-tight text-gray-900">Top Performing KPIs</h5>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left text-gray-500">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" class="px-3 py-2">Title</th>
                  <th scope="col" class="px-3 py-2">Target</th>
                  <th scope="col" class="px-3 py-2">Actual</th>
                  <th scope="col" class="px-3 py-2">Progress %</th>
                  <th scope="col" class="px-3 py-2">Status</th>
                  <th scope="col" class="px-3 py-2">End Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="dashboardStore.topKPIs.length === 0" class="bg-white">
                  <td colspan="6" class="px-3 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                      <Icon icon="mdi:chart-line" class="w-8 h-8 text-gray-300 mb-2" />
                      <span class="text-sm">ยังไม่มีข้อมูล KPI</span>
                    </div>
                  </td>
                </tr>
                <tr v-for="kpi in dashboardStore.topKPIs" :key="kpi.id" class="bg-white border-b hover:bg-gray-50">
                  <th scope="row" class="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">
                    <div>
                      <div class="text-xs font-medium">{{ kpi.title }}</div>
                    </div>
                  </th>
                  <td class="px-3 py-2">{{ formatNumber(kpi.target_value) }}</td>
                  <td class="px-3 py-2">{{ formatNumber(kpi.actual_value) }}</td>
                  <td class="px-3 py-2">
                    <div class="flex items-center">
                      <div class="w-12 bg-gray-200 rounded-full h-1.5 mr-1">
                        <div 
                          :class="getProgressBarColor(kpi.progress_percentage)" 
                          class="h-1.5 rounded-full" 
                          :style="{ width: `${Math.min(kpi.progress_percentage, 100)}%` }"
                        ></div>
                      </div>
                      <span :class="getProgressColor(kpi.progress_percentage)" class="font-medium text-xs">
                        {{ kpi.progress_percentage }}%
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-2 text-nowrap">
                    <span :class="getStatusBadgeClass(kpi.status)" class="px-1.5 py-0.5 text-xs font-medium rounded-full">
                      {{ kpi.status }}
                    </span>
                  </td>
                  <td class="px-3 py-2 text-nowrap">
                    <div class="text-xs text-gray-500">{{ kpi.days_remaining }} days left</div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- Filters Info -->
            <div v-if="Object.keys(dashboardStore.topKPIsFilters).length > 0" class="px-3 py-2 border-t border-gray-200">
              <div class="text-xs text-gray-500">
                Filters: 
                <span v-for="(value, key) in dashboardStore.topKPIsFilters" :key="key" class="ml-1">
                  {{ key }}: {{ value }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Updates -->
        <div class="bg-white border border-gray-200 rounded shadow-sm">
          <div class="px-3 py-2 border-b border-gray-200">
            <div class="flex justify-between items-center">
              <h5 class="text-base font-bold tracking-tight text-gray-900">Recent Updates</h5>
              <div class="text-xs text-gray-500">
                Limit: {{ dashboardStore.recentUpdatesLimit }}
              </div>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left text-gray-500">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" class="px-3 py-2">KPI Title</th>
                  <th scope="col" class="px-3 py-2">Status</th>
                  <th scope="col" class="px-3 py-2">Updated Value</th>
                  <th scope="col" class="px-3 py-2">Comment</th>
                  <th scope="col" class="px-3 py-2">Updated By</th>
                  <th scope="col" class="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="dashboardStore.recentUpdates.length === 0" class="bg-white">
                  <td colspan="6" class="px-3 py-8 text-center text-gray-500">
                    <div class="flex flex-col items-center">
                      <Icon icon="mdi:update" class="w-8 h-8 text-gray-300 mb-2" />
                      <span class="text-sm">ยังไม่มีข้อมูลการอัปเดต</span>
                    </div>
                  </td>
                </tr>
                <tr v-for="update in dashboardStore.recentUpdates" :key="update.id" class="bg-white border-b hover:bg-gray-50">
                  <th scope="row" class="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">
                    <div>
                      <div class="text-xs font-medium">{{ update.kpi_title }}</div>
                    </div>
                  </th>
                  <td class="px-3 py-2 text-nowrap">
                    <span :class="getStatusBadgeClass(update.kpi_status || update.status)" class="px-1.5 py-0.5 text-xs font-medium rounded-full">
                      {{ update.kpi_status || update.status }}
                    </span>
                  </td>
                  <td class="px-3 py-2">
                    <div class="font-medium text-xs">{{ formatNumber(update.updated_value) }}</div>
                  </td>
                  <td class="px-3 py-2 max-w-xs">
                    <div class="truncate text-xs" :title="update.comment">
                      {{ update.comment || '-' }}
                    </div>
                  </td>
                  <td class="px-3 py-2">
                    <div class="text-xs">{{ update.updated_by_name || `User ${update.updated_by}` }}</div>
                  </td>
                  <td class="px-3 py-2 text-nowrap">
                    <div class="text-xs text-gray-500">{{ getTimeAgo(update.createdAt || update.created_at) }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- Filters Info -->
            <div v-if="Object.keys(dashboardStore.recentUpdatesFilters).length > 0" class="px-3 py-2 border-t border-gray-200">
              <div class="text-xs text-gray-500">
                Filters: 
                <span v-for="(value, key) in dashboardStore.recentUpdatesFilters" :key="key" class="ml-1">
                  {{ key }}: {{ value }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section F: Analytics Summary -->
      <div class="bg-white border border-gray-200 rounded shadow-sm p-3">
        <div class="flex justify-between items-center mb-3">
          <h5 class="text-lg font-bold tracking-tight text-gray-900">Analytics Summary</h5>
          <div class="text-xs text-gray-500">
            Period: {{ dashboardStore.analyticsPeriod }}
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <!-- Completed KPIs -->
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-medium text-gray-700">
                Completed KPIs {{ dashboardStore.isAdminView ? '(ทั้งหมด)' : '(ของฉัน)' }}
              </span>
              <span class="text-xs font-bold text-green-600">{{ dashboardStore.overview.completed_kpis }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-green-600 h-2 rounded-full" :style="{ width: `${dashboardStore.analytics.completed_percentage}%` }"></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              {{ dashboardStore.analytics.completed_percentage }}% of {{ dashboardStore.isAdminView ? 'total' : 'my' }} KPIs
            </p>
          </div>

          <!-- Overdue KPIs -->
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-medium text-gray-700">
                Overdue KPIs {{ dashboardStore.isAdminView ? '(ทั้งหมด)' : '(ของฉัน)' }}
              </span>
              <span class="text-xs font-bold text-red-600">{{ dashboardStore.overview.overdue_kpis }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-red-600 h-2 rounded-full" :style="{ width: `${dashboardStore.analytics.overdue_percentage}%` }"></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              {{ dashboardStore.analytics.overdue_percentage }}% of {{ dashboardStore.isAdminView ? 'total' : 'my' }} KPIs
            </p>
          </div>

          <!-- Average Progress -->
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs font-medium text-gray-700">
                Average Progress {{ dashboardStore.isAdminView ? '(ทั้งหมด)' : '(ของฉัน)' }}
              </span>
              <span class="text-xs font-bold text-blue-600">{{ dashboardStore.analytics.average_progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" :style="{ width: `${dashboardStore.analytics.average_progress}%` }"></div>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              Overall {{ dashboardStore.isAdminView ? 'total' : 'my' }} KPI progress
            </p>
          </div>
        </div>

        <!-- Status Breakdown -->
        <div class="mt-4">
          <h6 class="text-base font-semibold text-gray-900 mb-2">
            Status Breakdown {{ dashboardStore.isAdminView ? '(ทั้งหมด)' : '(ของฉัน)' }}
          </h6>
          <div class="grid grid-cols-3 gap-2">
            <div v-for="(count, status) in dashboardStore.statusBreakdown" :key="status" class="text-center">
              <div class="text-lg font-bold" :class="getStatusTextColor(status)">{{ count }}</div>
              <div class="text-xs text-gray-600">{{ status }}</div>
            </div>
          </div>
        </div>

        <!-- Progress Ranges -->
        <div class="mt-4">
          <h6 class="text-base font-semibold text-gray-900 mb-2">
            Progress Ranges {{ dashboardStore.isAdminView ? '(ทั้งหมด)' : '(ของฉัน)' }}
          </h6>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div v-for="(count, range) in dashboardStore.analytics.progress_ranges" :key="range" class="text-center">
              <div class="text-lg font-bold text-gray-900">{{ count }}</div>
              <div class="text-xs text-gray-600">{{ range }}</div>
            </div>
          </div>
        </div>

        <!-- Filters Info -->
        <div v-if="Object.keys(dashboardStore.analyticsFilters).length > 0" class="mt-3 pt-3 border-t border-gray-200">
          <div class="text-xs text-gray-500">
            Filters: 
            <span v-for="(value, key) in dashboardStore.analyticsFilters" :key="key" class="ml-2">
              {{ key }}: {{ value }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { useAuthStore } from '../stores/auth'
import VueApexCharts from 'vue3-apexcharts'

// Components
const ApexChart = VueApexCharts

const dashboardStore = useDashboardStore()
const authStore = useAuthStore()

// Chart Options
const donutChartOptions = computed(() => ({
  chart: {
    type: 'donut',
    height: 250
  },
  labels: dashboardStore.statusChartData.map(item => item.name),
  colors: ['#10B981', '#F59E0B', '#EF4444'],
  legend: {
    position: 'bottom',
    fontSize: '12px'
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'bottom',
        fontSize: '10px'
      }
    }
  }]
}))

const donutChartSeries = computed(() => 
  dashboardStore.statusChartData.map(item => item.value)
)

const lineChartOptions = computed(() => ({
  chart: {
    height: 250,
    type: 'line',
    zoom: {
      enabled: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth'
  },
  xaxis: {
    categories: dashboardStore.trendsChartData.categories,
    labels: {
      style: {
        fontSize: '10px'
      }
    }
  },
  yaxis: {
    labels: {
      style: {
        fontSize: '10px'
      }
    }
  },
  colors: ['#10B981', '#F59E0B', '#EF4444'],
  legend: {
    position: 'top',
    fontSize: '12px'
  }
}))

// Helper Functions
const formatNumber = (number) => {
  if (typeof number === 'number') {
    return number.toLocaleString()
  }
  return number || 0
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('th-TH')
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return 'text-green-600'
  if (percentage >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'On Track': 'bg-green-100 text-green-800',
    'At Risk': 'bg-yellow-100 text-yellow-800',
    'Off Track': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getStatusTextColor = (status) => {
  const colors = {
    'On Track': 'text-green-600',
    'At Risk': 'text-yellow-600',
    'Off Track': 'text-red-600'
  }
  return colors[status] || 'text-gray-600'
}

const getProgressBarColor = (percentage) => {
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getTimeAgo = (dateString) => {
  if (!dateString) return '-'
  
  const now = new Date()
  const date = new Date(dateString)
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'เพิ่งอัปเดต'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} นาทีที่แล้ว`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ชั่วโมงที่แล้ว`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} วันที่แล้ว`
  return `${Math.floor(diffInSeconds / 2592000)} เดือนที่แล้ว`
}

const refreshDashboard = async () => {
  try {
    await dashboardStore.fetchAllDashboardData()
  } catch (error) {
    console.error('Error refreshing dashboard:', error)
  }
}

const toggleView = async () => {
  try {
    dashboardStore.toggleUserFilter()
    await dashboardStore.fetchAllDashboardData()
  } catch (error) {
    console.error('Error toggling view:', error)
  }
}

// Lifecycle
onMounted(async () => {
  try {
    // ตั้งค่า userFilter ตาม role ของ user
    const isAdmin = authStore.userRole === 'admin'
    dashboardStore.setUserFilter(isAdmin ? 'all' : 'current_user')
    
    await dashboardStore.fetchAllDashboardData({
      all_users: isAdmin
    })
  } catch (error) {
    console.error('Error loading dashboard:', error)
  }
})
</script>
