import { WorkflowType } from '@/lib/workflows/workflows'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Award, AlertTriangle } from 'lucide-react'

interface ReportViewerProps {
  workflowType: WorkflowType
  reportData: any
}

export default function ReportViewer({ workflowType, reportData }: ReportViewerProps) {
  if (!reportData) {
    return (
      <div className="text-center py-12 text-gray-500">
        Aucun rapport disponible
      </div>
    )
  }

  switch (workflowType) {
    case 'creator_insights':
      return <CreatorInsightsReport data={reportData} />

    case 'youtube_conversion':
      return <YoutubeConversionReport data={reportData} />

    case 'time_to_cash':
      return <TimeToCashReport data={reportData} />

    case 'performance_tracking':
      return <PerformanceTrackingReport data={reportData} />

    case 'call_analysis':
      return <CallAnalysisReport data={reportData} />

    case 'revenue_attribution':
      return <RevenueAttributionReport data={reportData} />

    default:
      return <GenericReport data={reportData} />
  }
}

// Generic report for workflows without custom view
function GenericReport({ data }: { data: any }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Résultats de l&apos;exécution</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs">
            {JSON.stringify(data, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

// Creator Insights Report
function CreatorInsightsReport({ data }: { data: any }) {
  const { top_creators = [], patterns = [], recommendations = {} } = data

  return (
    <div className="space-y-6">
      {/* Top Creators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Top 10 Créateurs Performants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {top_creators.slice(0, 10).map((creator: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <div className="font-medium">{creator.name}</div>
                    <div className="text-sm text-gray-500">
                      {creator.subscribers?.toLocaleString('fr-FR')} abonnés
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {creator.engagement_rate}% engagement
                  </div>
                  <div className="text-xs text-gray-500">{creator.videos_per_week} vidéos/sem</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Patterns Identifiés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {patterns.map((pattern: any, index: number) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">{pattern.title}</div>
                  <div className="text-sm text-blue-700">{pattern.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations de Contenu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.top_funnel && (
            <div>
              <h4 className="font-semibold mb-2">Top Funnel (Notoriété)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {recommendations.top_funnel.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          {recommendations.middle_funnel && (
            <div>
              <h4 className="font-semibold mb-2">Middle Funnel (Considération)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {recommendations.middle_funnel.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          {recommendations.bottom_funnel && (
            <div>
              <h4 className="font-semibold mb-2">Bottom Funnel (Conversion)</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {recommendations.bottom_funnel.map((rec: string, i: number) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// YouTube Conversion Report
function YoutubeConversionReport({ data }: { data: any }) {
  const { videos = [], total_calls = 0, avg_conversion = 0, insights = [] } = data

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Vidéos Analysées</div>
            <div className="text-3xl font-bold">{videos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Appels Générés</div>
            <div className="text-3xl font-bold text-green-600">{total_calls}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Taux Conversion Moyen</div>
            <div className="text-3xl font-bold text-blue-600">{avg_conversion}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Videos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par Vidéo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Vidéo</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Vues</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Appels</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {videos.slice(0, 20).map((video: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{video.title}</td>
                    <td className="px-4 py-3 text-sm text-right">{video.views?.toLocaleString('fr-FR')}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{video.calls}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`font-semibold ${video.conversion_rate > 5 ? 'text-green-600' : video.conversion_rate > 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {video.conversion_rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight: string, index: number) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-900">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Time to Cash Report
function TimeToCashReport({ data }: { data: any }) {
  const { productivity_score = 0, activities = [], recommendations = [] } = data

  return (
    <div className="space-y-6">
      {/* Productivity Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Score de Productivité</div>
            <div className="text-6xl font-bold mb-2" style={{
              color: productivity_score >= 80 ? '#10B981' : productivity_score >= 60 ? '#F59E0B' : '#EF4444'
            }}>
              {productivity_score}
            </div>
            <div className="text-sm text-gray-600">/100</div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Temps vs Revenus par Activité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity: any, index: number) => {
              const roi = activity.revenue / activity.hours
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{activity.name}</h4>
                    <span className="text-sm font-semibold text-green-600">
                      {activity.revenue.toLocaleString('fr-FR')}€
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{activity.hours}h investies</span>
                    <span className="font-medium">ROI: {roi.toFixed(0)}€/h</span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600"
                      style={{ width: `${Math.min((activity.revenue / 10000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommandations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recommendations.map((rec: string, index: number) => (
              <div key={index} className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-sm text-purple-900">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Performance Tracking Report
function PerformanceTrackingReport({ data }: { data: any }) {
  const { platforms = [], alerts = [], trend = 'stable' } = data

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            {trend === 'up' && <TrendingUp className="h-16 w-16 text-green-600 mx-auto mb-2" />}
            {trend === 'down' && <TrendingDown className="h-16 w-16 text-red-600 mx-auto mb-2" />}
            {trend === 'stable' && <div className="h-16 w-16 border-4 border-blue-600 rounded-full mx-auto mb-2" />}
            <div className="text-xl font-semibold">
              Tendance : {trend === 'up' ? 'En hausse' : trend === 'down' ? 'En baisse' : 'Stable'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platforms Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par Plateforme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {platforms.map((platform: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-lg">{platform.name}</h4>
                  <div className="flex items-center gap-2">
                    {platform.change > 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${platform.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {platform.change > 0 ? '+' : ''}{platform.change}%
                    </span>
                  </div>
                </div>
                {platform.chart_data && (
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={platform.chart_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert: string, index: number) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-900">{alert}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Call Analysis Report
function CallAnalysisReport({ data }: { data: any }) {
  const { calls_analyzed = 0, closing_rate = 0, pain_points = [], objections = [], avatar = null } = data

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Appels Analysés</div>
            <div className="text-3xl font-bold">{calls_analyzed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Taux de Closing</div>
            <div className="text-3xl font-bold text-green-600">{closing_rate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Pain Points */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Pain Points Identifiés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pain_points.slice(0, 5).map((pain: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">{pain.text}</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {pain.frequency} fois
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Objections */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Objections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {objections.slice(0, 5).map((obj: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm">{obj.text}</span>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                  {obj.frequency} fois
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Avatar Client */}
      {avatar && (
        <Card>
          <CardHeader>
            <CardTitle>Avatar Client Généré</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {avatar.demographics && (
              <div>
                <h4 className="font-semibold mb-2">Démographie</h4>
                <p className="text-sm text-gray-700">{avatar.demographics}</p>
              </div>
            )}
            {avatar.goals && (
              <div>
                <h4 className="font-semibold mb-2">Objectifs</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {avatar.goals.map((goal: string, i: number) => (
                    <li key={i}>{goal}</li>
                  ))}
                </ul>
              </div>
            )}
            {avatar.pain_points && (
              <div>
                <h4 className="font-semibold mb-2">Pain Points</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {avatar.pain_points.map((pain: string, i: number) => (
                    <li key={i}>{pain}</li>
                  ))}
                </ul>
              </div>
            )}
            {avatar.conversion_triggers && (
              <div>
                <h4 className="font-semibold mb-2">Triggers de Conversion</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {avatar.conversion_triggers.map((trigger: string, i: number) => (
                    <li key={i}>{trigger}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Revenue Attribution Report
function RevenueAttributionReport({ data }: { data: any }) {
  const { total_revenue = 0, channels = [], ltv_by_source = [], top_channel = {} } = data

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">CA Total Attribué</div>
            <div className="text-3xl font-bold text-green-600">{total_revenue.toLocaleString('fr-FR')}€</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-500">Canal le Plus Rentable</div>
            <div className="text-2xl font-bold">{top_channel.name}</div>
            <div className="text-sm text-gray-600">{top_channel.revenue?.toLocaleString('fr-FR')}€</div>
          </CardContent>
        </Card>
      </div>

      {/* Channels Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Attribution par Canal</CardTitle>
        </CardHeader>
        <CardContent>
          {channels.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" name="Revenus (€)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* LTV by Source */}
      <Card>
        <CardHeader>
          <CardTitle>LTV Moyen par Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ltv_by_source.map((source: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{source.source}</span>
                <span className="text-lg font-bold text-green-600">
                  {source.ltv.toLocaleString('fr-FR')}€
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
