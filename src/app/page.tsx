'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Search, 
  RefreshCw, 
  Calendar, 
  Users, 
  Eye, 
  Play,
  BarChart3,
  Settings,
  FileText,
  Filter,
  Bot,
  Globe,
  Save,
  Download,
  Github
} from 'lucide-react';

interface YouTubeChannel {
  id: string;
  channelId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
  videos?: YouTubeVideo[];
}

interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  thumbnailUrl?: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
}

interface DailyReport {
  id: string;
  title: string;
  summary: string;
  reportType: string;
  reportDate: string;
  insights?: string;
  isSent: boolean;
}

interface SearchFilters {
  maxAgeDays: number;
  minSubscribers: number;
  minViews: number;
  country: string;
  keywords: string;
  maxChannels: number;
}

interface AISettings {
  provider: 'gemini' | 'openai' | 'zai';
  apiKey?: string;
  model?: string;
}

export default function Home() {
  const [channels, setChannels] = useState<YouTubeChannel[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchUrl, setSearchUrl] = useState('');
  const [activeTab, setActiveTab] = useState('channels');
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    maxAgeDays: 30,
    minSubscribers: 1000,
    minViews: 10000,
    country: 'US',
    keywords: '',
    maxChannels: 10
  });
  const [aiSettings, setAISettings] = useState<AISettings>({
    provider: 'zai',
    apiKey: '',
    model: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [showGithubSettings, setShowGithubSettings] = useState(false);
  const [githubSettings, setGithubSettings] = useState({
    repoUrl: '',
    token: '',
    username: '',
    repoName: ''
  });

  useEffect(() => {
    loadChannels();
    loadReports();
    loadSettings();
  }, []);

  const loadSettings = () => {
    const savedFilters = localStorage.getItem('youtubeSearchFilters');
    const savedAISettings = localStorage.getItem('youtubeAISettings');
    const savedGithubSettings = localStorage.getItem('githubSettings');
    
    if (savedFilters) {
      setSearchFilters(JSON.parse(savedFilters));
    }
    
    if (savedAISettings) {
      setAISettings(JSON.parse(savedAISettings));
    }

    if (savedGithubSettings) {
      setGithubSettings(JSON.parse(savedGithubSettings));
    }
  };

  const saveSettings = () => {
    localStorage.setItem('youtubeSearchFilters', JSON.stringify(searchFilters));
    localStorage.setItem('youtubeAISettings', JSON.stringify(aiSettings));
    localStorage.setItem('githubSettings', JSON.stringify(githubSettings));
    setShowAISettings(false);
    alert('Configurações salvas com sucesso!');
  };

  const saveGithubSettings = () => {
    localStorage.setItem('githubSettings', JSON.stringify(githubSettings));
    setShowGithubSettings(false);
    alert('Configurações do GitHub salvas com sucesso!');
  };

  const pushToGithub = async () => {
    if (!githubSettings.username || !githubSettings.repoName || !githubSettings.token) {
      alert('Por favor, preencha todos os campos do GitHub.');
      return;
    }

    // Validar formato do token
    if (!githubSettings.token.startsWith('ghp_') && !githubSettings.token.startsWith('gho_')) {
      alert('Token do GitHub inválido. O token deve começar com "ghp_" ou "gho_".');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/export/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(githubSettings)
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`✅ Projeto enviado para GitHub com sucesso!\n\n📍 Repositório: ${data.repoUrl}\n\nVocê pode acessar seu projeto no link acima.`);
        setShowGithubSettings(false);
        // Opcional: abrir o repositório em nova aba
        if (confirm('Deseja abrir o repositório no GitHub?')) {
          window.open(data.repoUrl, '_blank');
        }
      } else {
        alert(`❌ Erro ao enviar para GitHub:\n\n${data.error}\n\nVerifique:\n• Se o token tem permissões de "repo"\n• Se o nome de usuário está correto\n• Se o repositório não existe com nome diferente`);
      }
    } catch (error) {
      console.error('Error pushing to GitHub:', error);
      alert(`❌ Erro ao enviar para GitHub:\n\n${error.message}\n\nPor favor, verifique sua conexão e tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  const loadChannels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/youtube/channels?limit=20');
      const data = await response.json();
      if (data.success) {
        setChannels(data.data.channels);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const response = await fetch('/api/reports?limit=10');
      const data = await response.json();
      if (data.success) {
        setReports(data.data.reports);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const scrapeChannel = async () => {
    if (!searchUrl) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/youtube/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scrapeChannel', url: searchUrl })
      });
      
      const data = await response.json();
      if (data.success) {
        await loadChannels();
        setSearchUrl('');
      } else {
        alert('Erro ao buscar informações do canal: ' + data.error);
      }
    } catch (error) {
      console.error('Error scraping channel:', error);
      alert('Erro ao buscar informações do canal');
    } finally {
      setLoading(false);
    }
  };

  const searchTrending = async () => {
    try {
      setLoading(true);
      console.log('Iniciando busca de canais em alta...');
      
      const response = await fetch('/api/youtube/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'searchTrending', 
          maxAgeDays: searchFilters.maxAgeDays,
          minSubscribers: searchFilters.minSubscribers,
          minViews: searchFilters.minViews,
          country: searchFilters.country,
          keywords: searchFilters.keywords,
          maxChannels: searchFilters.maxChannels
        })
      });
      
      const data = await response.json();
      console.log('Resposta da API:', data);
      
      if (data.success) {
        await loadChannels();
        const channelCount = data.data?.length || 0;
        alert(`✅ Busca concluída com sucesso!\n\nEncontrados ${channelCount} canais que atendem aos critérios:\n• País: ${searchFilters.country}\n• Idade máxima: ${searchFilters.maxAgeDays} dias\n• Inscritos mínimos: ${searchFilters.minSubscribers}\n• Visualizações mínimas: ${searchFilters.minViews}\n• Limite de canais: ${searchFilters.maxChannels}${searchFilters.keywords ? `\n• Palavras-chave: ${searchFilters.keywords}` : ''}`);
      } else {
        alert(`❌ Erro ao buscar canais em alta:\n\n${data.error}\n\nIsso pode acontecer devido a:\n• Limitações da API do YouTube\n• Problemas de conexão com a internet\n• Filtros muito restritivos\n\nTente novamente ou ajuste os filtros.`);
      }
    } catch (error) {
      console.error('Error searching trending channels:', error);
      alert(`❌ Erro ao buscar canais em alta:\n\n${error.message}\n\nVerifique sua conexão com a internet e tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  const testSearch = async () => {
    try {
      setLoading(true);
      console.log('Iniciando teste de busca...');
      
      const params = new URLSearchParams({
        maxAgeDays: searchFilters.maxAgeDays.toString(),
        minSubscribers: searchFilters.minSubscribers.toString(),
        minViews: searchFilters.minViews.toString(),
        country: searchFilters.country,
        keywords: searchFilters.keywords,
        maxChannels: searchFilters.maxChannels.toString()
      });
      
      const response = await fetch(`/api/youtube/test-search?${params}`);
      const data = await response.json();
      
      console.log('Resposta do teste:', data);
      
      if (data.success) {
        const channelCount = data.data?.count || 0;
        alert(`✅ Teste de busca realizado com sucesso!\n\nEncontrados ${channelCount} canais que atendem aos critérios.\n\nOs canais foram salvos no banco de dados e você pode vê-los na aba "Canais".`);
        await loadChannels();
      } else {
        alert(`❌ Erro no teste de busca:\n\n${data.error}\n\nIsso indica que pode haver problemas com:\n• Acesso à API do YouTube\n• Configurações dos filtros\n• Conexão com a internet\n\nTente ajustar os filtros ou verificar sua conexão.`);
      }
    } catch (error) {
      console.error('Error testing search:', error);
      alert(`❌ Erro no teste de busca:\n\n${error.message}\n\nVerifique sua conexão com a internet e tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reportType: 'trending', 
          title: 'Relatório de Tendências', 
          summary: 'Análise de canais em alta dos últimos 30 dias',
          aiSettings
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await loadReports();
      } else {
        alert('Erro ao gerar relatório: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const clearChannels = async () => {
    if (!confirm('Tem certeza que deseja limpar todos os canais e vídeos? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/youtube/channels/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`✅ Canais limpos com sucesso!\n\nForam removidos ${data.data.channelsCleared} canais e ${data.data.videosCleared} vídeos.\n\nAgora você pode buscar canais reais.`);
        setChannels([]);
        setReports([]);
      } else {
        alert(`❌ Erro ao limpar canais:\n\n${data.error}`);
      }
    } catch (error) {
      console.error('Error clearing channels:', error);
      alert(`❌ Erro ao limpar canais:\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  

  const fetchRealVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/youtube/videos/fetch/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`✅ Vídeos reais buscados com sucesso!\n\nForam buscados ${data.data.totalVideosFetched} vídeos de ${data.data.channelsProcessed} canais.\n\nAtualize a lista para ver os vídeos reais.`);
        await loadChannels();
      } else {
        alert(`❌ Erro ao buscar vídeos reais:\n\n${data.error}\n\nIsso pode acontecer devido a limitações da API do YouTube ou problemas de conexão.`);
      }
    } catch (error) {
      console.error('Error fetching real videos:', error);
      alert(`❌ Erro ao buscar vídeos reais:\n\n${error.message}\n\nVerifique sua conexão com a internet e tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  const addDemoVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/youtube/videos/demo/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (data.success) {
        alert(`✅ Vídeos de demonstração criados com sucesso!\n\nForam criados ${data.data.totalVideosCreated} vídeos para ${data.data.channelsProcessed} canais.\n\nAtualize a lista para ver os vídeos.`);
        await loadChannels();
      } else {
        alert(`❌ Erro ao criar vídeos de demonstração:\n\n${data.error}`);
      }
    } catch (error) {
      console.error('Error adding demo videos:', error);
      alert(`❌ Erro ao criar vídeos de demonstração:\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadProject = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/export/project');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'youtube-trends-monitor.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading project:', error);
      alert('Erro ao baixar o projeto');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">YouTube Trends Monitor</h1>
          <p className="text-muted-foreground">
            Sistema de monitoramento de canais em alta do YouTube com análise por IA
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Controles do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca Automática */}
            <div className="space-y-4">
              <div className="text-sm font-medium text-foreground">
                <TrendingUp className="h-4 w-4 inline mr-2" />
                Busca Automática de Canais em Alta
              </div>
              <p className="text-sm text-muted-foreground">
                Use os filtros abaixo para buscar automaticamente canais nos EUA com até 30 dias de criação que têm muitas visualizações e seguidores.
              </p>
              
              {/* Botões de Ação Principais */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={searchTrending} disabled={loading} className="bg-primary">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Buscar Canais em Alta
                </Button>
                <Button onClick={testSearch} disabled={loading} variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Testar Busca
                </Button>
                <Button onClick={() => setShowFilters(true)} disabled={loading} variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Configurar Filtros
                </Button>
                <Button onClick={generateReport} disabled={loading} variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Relatório
                </Button>
                <Button onClick={() => setShowAISettings(true)} disabled={loading} variant="outline">
                  <Bot className="h-4 w-4 mr-2" />
                  Configurar IA
                </Button>
                <Button onClick={downloadProject} disabled={loading} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Projeto
                </Button>
                <Button onClick={clearChannels} disabled={loading} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar Canais
                </Button>
                <Button onClick={fetchRealVideos} disabled={loading} variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar Vídeos Reais
                </Button>
                <Button onClick={addDemoVideos} disabled={loading} variant="outline">
                  <Play className="h-4 w-4 mr-2" />
                  Adicionar Vídeos Demo
                </Button>
                <Button onClick={() => setShowGithubSettings(true)} disabled={loading} variant="outline">
                  <Github className="h-4 w-4 mr-2" />
                  Enviar para GitHub
                </Button>
                <Button onClick={loadChannels} disabled={loading} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Lista
                </Button>
              </div>
            </div>

            {/* Status dos Filtros */}
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="text-muted-foreground">Filtros ativos:</span>
              <Badge variant="secondary">
                📅 {searchFilters.maxAgeDays} dias
              </Badge>
              <Badge variant="secondary">
                👥 {formatNumber(searchFilters.minSubscribers)} inscritos
              </Badge>
              <Badge variant="secondary">
                👁️ {formatNumber(searchFilters.minViews)} visualizações
              </Badge>
              <Badge variant="secondary">
                🌍 {searchFilters.country}
              </Badge>
              {searchFilters.keywords && (
                <Badge variant="secondary">
                  🔍 {searchFilters.keywords}
                </Badge>
              )}
            </div>

            {/* Busca Manual (Opcional) */}
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-foreground mb-2">
                <Search className="h-4 w-4 inline mr-2" />
                Busca Manual (Opcional)
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  placeholder="URL específica do canal do YouTube..."
                  value={searchUrl}
                  onChange={(e) => setSearchUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && scrapeChannel()}
                />
                <Button onClick={scrapeChannel} disabled={loading || !searchUrl} variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Adicionar Canal
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Use esta opção apenas se quiser adicionar um canal específico conhecido.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="channels" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Canais ({channels.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Relatórios ({reports.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Carregando canais...</p>
              </div>
            ) : channels.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Nenhum canal encontrado. Use os controles acima para buscar canais em alta ou adicionar canais específicos.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {channels.map((channel) => (
                  <Card key={channel.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        {channel.thumbnailUrl && (
                          <img
                            src={channel.thumbnailUrl}
                            alt={channel.title}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium line-clamp-2">
                            {channel.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {formatNumber(channel.subscriberCount)} inscritos
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {formatNumber(channel.viewCount)} visualizações
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Link e ID do Canal */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">ID do Canal:</span>
                            <Badge variant="outline" className="text-xs font-mono">
                              {channel.channelId}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <a 
                              href={`https://www.youtube.com/channel/${channel.channelId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
                              title={`Abrir canal: ${channel.title}`}
                            >
                              youtube.com/channel/{channel.channelId}
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            {channel.videoCount} vídeos
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(channel.publishedAt)}
                          </span>
                        </div>
                        
                        {channel.videos && channel.videos.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Top 5 vídeos mais visualizados:</p>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {channel.videos.slice(0, 5).map((video, index) => (
                                <div key={video.id} className="flex items-center gap-2 text-xs p-1 rounded hover:bg-muted/50 transition-colors">
                                  <span className="text-xs font-medium text-muted-foreground w-4">
                                    #{index + 1}
                                  </span>
                                  {video.thumbnailUrl && (
                                    <img
                                      src={video.thumbnailUrl}
                                      alt={video.title}
                                      className="w-10 h-6 rounded object-cover flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate font-medium text-xs" title={video.title}>
                                      {video.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                      <span className="flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        {formatNumber(video.viewCount)}
                                      </span>
                                      {video.likeCount > 0 && (
                                        <span className="flex items-center gap-1">
                                          <span className="text-xs">👍</span>
                                          {formatNumber(video.likeCount)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <a 
                                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline flex-shrink-0"
                                    title="Assistir vídeo"
                                  >
                                    <Play className="h-3 w-3" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Carregando relatórios...</p>
              </div>
            ) : reports.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Nenhum relatório encontrado. Gere seu primeiro relatório usando o botão acima.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{report.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant={report.reportType === 'trending' ? 'default' : 'secondary'}>
                              {report.reportType}
                            </Badge>
                            <span>{formatDate(report.reportDate)}</span>
                            {report.isSent && (
                              <Badge variant="outline">Enviado</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{report.summary}</p>
                      
                      {report.insights && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Insights da IA:</h4>
                          <ScrollArea className="h-32 w-full border rounded-md p-3">
                            <p className="text-sm whitespace-pre-wrap">{report.insights}</p>
                          </ScrollArea>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de Filtros */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filtros de Busca</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxAgeDays" className="text-right">
                Idade Máx (dias)
              </Label>
              <Input
                id="maxAgeDays"
                type="number"
                value={searchFilters.maxAgeDays}
                onChange={(e) => setSearchFilters({...searchFilters, maxAgeDays: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minSubscribers" className="text-right">
                Inscritos Mín
              </Label>
              <Input
                id="minSubscribers"
                type="number"
                value={searchFilters.minSubscribers}
                onChange={(e) => setSearchFilters({...searchFilters, minSubscribers: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="minViews" className="text-right">
                Views Mín
              </Label>
              <Input
                id="minViews"
                type="number"
                value={searchFilters.minViews}
                onChange={(e) => setSearchFilters({...searchFilters, minViews: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                País
              </Label>
              <Select
                value={searchFilters.country}
                onValueChange={(value) => setSearchFilters({...searchFilters, country: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">Estados Unidos</SelectItem>
                  <SelectItem value="BR">Brasil</SelectItem>
                  <SelectItem value="GB">Reino Unido</SelectItem>
                  <SelectItem value="CA">Canadá</SelectItem>
                  <SelectItem value="AU">Austrália</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="keywords" className="text-right">
                Palavras-chave
              </Label>
              <Input
                id="keywords"
                placeholder="separadas por vírgula"
                value={searchFilters.keywords}
                onChange={(e) => setSearchFilters({...searchFilters, keywords: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxChannels" className="text-right">
                Máx de Canais
              </Label>
              <Input
                id="maxChannels"
                type="number"
                min="1"
                max="50"
                value={searchFilters.maxChannels}
                onChange={(e) => setSearchFilters({...searchFilters, maxChannels: parseInt(e.target.value)})}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowFilters(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              localStorage.setItem('youtubeSearchFilters', JSON.stringify(searchFilters));
              setShowFilters(false);
            }}>
              Salvar Filtros
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Configurações de IA */}
      <Dialog open={showAISettings} onOpenChange={setShowAISettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configurações de IA</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="aiProvider" className="text-right">
                Provedor
              </Label>
              <Select
                value={aiSettings.provider}
                onValueChange={(value: 'gemini' | 'openai' | 'zai') => 
                  setAISettings({...aiSettings, provider: value})
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zai">Z.AI (Padrão)</SelectItem>
                  <SelectItem value="gemini">Google Gemini</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {aiSettings.provider !== 'zai' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apiKey" className="text-right">
                    API Key
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Sua chave de API"
                    value={aiSettings.apiKey}
                    onChange={(e) => setAISettings({...aiSettings, apiKey: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="model" className="text-right">
                    Modelo
                  </Label>
                  <Select
                    value={aiSettings.model}
                    onValueChange={(value) => setAISettings({...aiSettings, model: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {aiSettings.provider === 'gemini' ? (
                        <>
                          <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                          <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAISettings(false)}>
              Cancelar
            </Button>
            <Button onClick={saveSettings}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Configurações do GitHub */}
      <Dialog open={showGithubSettings} onOpenChange={setShowGithubSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configurações do GitHub</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Usuário
              </Label>
              <Input
                id="username"
                placeholder="seu-usuario"
                value={githubSettings.username}
                onChange={(e) => setGithubSettings({...githubSettings, username: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="repoName" className="text-right">
                Repositório
              </Label>
              <Input
                id="repoName"
                placeholder="youtube-trends-monitor"
                value={githubSettings.repoName}
                onChange={(e) => setGithubSettings({...githubSettings, repoName: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="token" className="text-right">
                Token
              </Label>
              <Input
                id="token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={githubSettings.token}
                onChange={(e) => setGithubSettings({...githubSettings, token: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="text-xs text-muted-foreground col-span-4">
              <p className="font-semibold mb-2">📋 Como obter um GitHub Token:</p>
              <p>1. Acesse: <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">github.com/settings/tokens</a></p>
              <p>2. Clique em "Generate new token" → "Generate new token (classic)"</p>
              <p>3. Dê um nome ao token (ex: "YouTube Trends Monitor")</p>
              <p>4. Selecione as permissões: ✅ repo, ✅ workflow</p>
              <p>5. Clique em "Generate token" e copie o token gerado</p>
              <p className="mt-2 font-semibold">⚠️ Importante:</p>
              <p>• O token começa com "ghp_"</p>
              <p>• Guarde o token em local seguro (não será exibido novamente)</p>
              <p>• O repositório será criado automaticamente se não existir</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowGithubSettings(false)}>
              Cancelar
            </Button>
            <Button onClick={saveGithubSettings} variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
            <Button onClick={pushToGithub}>
              <Github className="h-4 w-4 mr-2" />
              Enviar para GitHub
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}