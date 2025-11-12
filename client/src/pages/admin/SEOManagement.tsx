import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Search, Globe, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { SeoSettings } from "@shared/schema";

export default function SEOManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [keywordInput, setKeywordInput] = useState("");

  // Form state
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [robotsMetaTag, setRobotsMetaTag] = useState("index, follow");
  const [schemaMarkup, setSchemaMarkup] = useState("");

  // Fetch global SEO settings
  const { data: seoSettings, isLoading } = useQuery<SeoSettings>({
    queryKey: ["/api/seo/global"],
  });

  // Initialize form state when data is loaded
  useEffect(() => {
    if (seoSettings) {
      setMetaTitle(seoSettings.metaTitle || "");
      setMetaDescription(seoSettings.metaDescription || "");
      setKeywords(seoSettings.keywords || []);
      setCanonicalUrl(seoSettings.canonicalUrl || "");
      setRobotsMetaTag(seoSettings.robotsMetaTag || "index, follow");
      setSchemaMarkup(seoSettings.schemaMarkup ? JSON.stringify(seoSettings.schemaMarkup, null, 2) : "");
    }
  }, [seoSettings]);

  // Update SEO settings mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SeoSettings>) => {
      return apiRequest("PUT", "/api/seo/global", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seo/global"] });
      toast({
        title: "Success",
        description: "SEO settings updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update SEO settings",
        variant: "destructive",
      });
    },
  });

  const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
      }
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter((k) => k !== keyword));
  };

  const handleSave = () => {
    let parsedSchemaMarkup = null;
    if (schemaMarkup.trim()) {
      try {
        parsedSchemaMarkup = JSON.parse(schemaMarkup);
      } catch (error) {
        toast({
          title: "Invalid Schema Markup",
          description: "Please enter valid JSON for schema markup",
          variant: "destructive",
        });
        return;
      }
    }

    updateMutation.mutate({
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      keywords,
      canonicalUrl: canonicalUrl || null,
      robotsMetaTag,
      schemaMarkup: parsedSchemaMarkup,
    });
  };

  const generateExampleSchema = () => {
    const exampleSchema = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Panda HoHo | China Travel Community",
      "description": "Explore authentic China with city guides by locals and seasoned travelers—covering food, shopping, nightlife, art and hidden gems",
      "url": "https://pandahoho.com",
      "applicationCategory": "TravelApplication",
      "operatingSystem": "Web"
    };
    setSchemaMarkup(JSON.stringify(exampleSchema, null, 2));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold" data-testid="page-title">
          SEO & Meta Management
        </h1>
        <Card>
          <CardContent className="p-6">
            <div className="h-96 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="page-title">
          SEO & Meta Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Optimize your app for search engines and AI discovery.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
            <Search className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Optimize your content for both traditional search engines (Google, Bing) and AI search engines (ChatGPT, Perplexity, Claude) to improve discoverability.
            </p>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Page Selection</CardTitle>
          <CardDescription>Choose which page to configure SEO settings for</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value="global" disabled>
            <SelectTrigger data-testid="select-page-type">
              <SelectValue placeholder="Select page..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global Settings...</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardHeader>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic" data-testid="tab-basic-seo">
                <Search className="h-4 w-4 mr-2" />
                Basic SEO
              </TabsTrigger>
              <TabsTrigger value="technical" data-testid="tab-technical-seo">
                <Globe className="h-4 w-4 mr-2" />
                Technical
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="basic" className="space-y-6">
              <div>
                <CardTitle className="text-lg mb-4">Basic SEO Settings</CardTitle>
                <CardDescription>Essential SEO information for search engines</CardDescription>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  data-testid="input-meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Panda HoHo | China Travel Community"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {metaTitle.length}/60 characters (recommended: 50-60)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  data-testid="textarea-meta-description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Explore authentic China with city guides by locals and seasoned travelers—covering food, shopping, nightlife, art and hidden gems"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {metaDescription.length}/160 characters (recommended: 150-160)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  data-testid="input-keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="Add keyword and press Enter"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywords.map((keyword) => (
                    <Badge
                      key={keyword}
                      variant="secondary"
                      className="gap-1"
                      data-testid={`keyword-${keyword}`}
                    >
                      {keyword}
                      <button
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-1 hover:text-destructive"
                        data-testid={`button-remove-keyword-${keyword}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-6">
              <div>
                <CardTitle className="text-lg mb-4">Technical SEO</CardTitle>
                <CardDescription>Advanced SEO settings for search engine optimization</CardDescription>
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonical-url">Canonical URL</Label>
                <Input
                  id="canonical-url"
                  data-testid="input-canonical-url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://pandahoho.com/"
                />
                <p className="text-xs text-muted-foreground">
                  Prevents duplicate content issues
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="robots-meta-tag">Robots Meta Tag</Label>
                <Select value={robotsMetaTag} onValueChange={setRobotsMetaTag}>
                  <SelectTrigger id="robots-meta-tag" data-testid="select-robots-meta-tag">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index, follow">Index, Follow (Default)</SelectItem>
                    <SelectItem value="noindex, follow">NoIndex, Follow</SelectItem>
                    <SelectItem value="index, nofollow">Index, NoFollow</SelectItem>
                    <SelectItem value="noindex, nofollow">NoIndex, NoFollow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="schema-markup">Schema Markup (JSON-LD)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateExampleSchema}
                    data-testid="button-generate-schema"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Generate Example Schema
                  </Button>
                </div>
                <Textarea
                  id="schema-markup"
                  data-testid="textarea-schema-markup"
                  value={schemaMarkup}
                  onChange={(e) => setSchemaMarkup(e.target.value)}
                  placeholder='{\n  "@context": "https://schema.org",\n  "@type": "WebApplication",\n  ...\n}'
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setMetaTitle(seoSettings?.metaTitle || "");
                  setMetaDescription(seoSettings?.metaDescription || "");
                  setKeywords(seoSettings?.keywords || []);
                  setCanonicalUrl(seoSettings?.canonicalUrl || "");
                  setRobotsMetaTag(seoSettings?.robotsMetaTag || "index, follow");
                  setSchemaMarkup(seoSettings?.schemaMarkup ? JSON.stringify(seoSettings.schemaMarkup, null, 2) : "");
                }}
                data-testid="button-reset"
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                data-testid="button-save"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
