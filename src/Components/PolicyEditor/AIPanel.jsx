import React, { useState, useEffect, useMemo } from "react";
import { Sparkles, CheckCircle, AlertCircle, X, Loader2, RefreshCw } from "lucide-react";
import { Button, Card, Spin, Alert, Progress, Badge, Tabs } from "antd";
import { apiRequest } from "../../utils/api";
import { message } from "antd";

// Simple hash function for content comparison
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
};

// Cache keys
const getReviewCacheKey = (policyId, policyText) => {
  const contentHash = hashString(policyText || "");
  return `ai_review_${policyId}_${contentHash}`;
};

const getAnalysisCacheKey = (policyId) => {
  return `ai_analysis_${policyId}`;
};

// Cache duration: 1 hour (3600000 ms)
const CACHE_DURATION = 60 * 60 * 1000;

const getCachedData = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is expired
    if (now - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
};

const setCachedData = (key, data) => {
  try {
    const cache = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cache));
  } catch (error) {
    console.error("Error writing cache:", error);
  }
};

const AIPanel = ({ policyId, policyText, policyType = "Information Security" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [isReviewCached, setIsReviewCached] = useState(false);
  const [isAnalysisCached, setIsAnalysisCached] = useState(false);
  const [activeTab, setActiveTab] = useState("review");

  // Generate cache keys based on current props
  const reviewCacheKey = useMemo(
    () => policyId && policyText ? getReviewCacheKey(policyId, policyText) : null,
    [policyId, policyText]
  );
  
  const analysisCacheKey = useMemo(
    () => policyId ? getAnalysisCacheKey(policyId) : null,
    [policyId]
  );

  // Load cached data on mount or when cache keys change
  useEffect(() => {
    if (reviewCacheKey) {
      const cached = getCachedData(reviewCacheKey);
      if (cached) {
        setReviewData(cached);
        setIsReviewCached(true);
        setActiveTab("review"); // Switch to review tab when cached data loads
      } else {
        setIsReviewCached(false);
      }
    }
  }, [reviewCacheKey]);

  useEffect(() => {
    if (analysisCacheKey) {
      const cached = getCachedData(analysisCacheKey);
      if (cached) {
        setAnalysisData(cached);
        setIsAnalysisCached(true);
        // Only switch to analysis tab if review data doesn't exist
        if (!reviewData) {
          setActiveTab("analysis");
        }
      } else {
        setIsAnalysisCached(false);
      }
    }
  }, [analysisCacheKey, reviewData]);

  const handleReview = async (forceRefresh = false) => {
    if (!policyText || policyText.trim().length < 100) {
      message.warning("Please add more content before requesting AI review");
      return;
    }

    // Check cache first (unless forcing refresh)
    if (!forceRefresh && reviewCacheKey) {
      const cached = getCachedData(reviewCacheKey);
      if (cached) {
        setReviewData(cached);
        setIsReviewCached(true);
        message.info("Loaded cached review results");
        return;
      }
    }
    setIsReviewCached(false);

    setIsLoading(true);
    try {
      const response = await apiRequest(
        "POST",
        "/api/plc_workflow/ai/review/",
        {
          policy_text: policyText,
          policy_type: policyType,
        },
        true
      );

      if (response.data) {
        setReviewData(response.data);
        setIsReviewCached(false); // Fresh data, not from cache
        setActiveTab("review"); // Switch to review tab
        // Cache the response
        if (reviewCacheKey) {
          setCachedData(reviewCacheKey, response.data);
        }
        message.success("AI review completed");
      }
    } catch (error) {
      console.error("Error getting AI review:", error);
      message.error(error.data?.error || "Failed to get AI review");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullAnalysis = async (forceRefresh = false) => {
    if (!policyId) {
      message.warning("Policy ID is required for full analysis");
      return;
    }

    // Check cache first (unless forcing refresh)
    if (!forceRefresh && analysisCacheKey) {
      const cached = getCachedData(analysisCacheKey);
      if (cached) {
        setAnalysisData(cached);
        setIsAnalysisCached(true);
        message.info("Loaded cached analysis results");
        return;
      }
    }
    setIsAnalysisCached(false);

    setIsAnalyzing(true);
    try {
      const response = await apiRequest(
        "POST",
        `/api/plc_workflow/ai/analyze/${policyId}/`,
        null,
        true
      );

      if (response.data) {
        setAnalysisData(response.data);
        setIsAnalysisCached(false); // Fresh data, not from cache
        setActiveTab("analysis"); // Switch to analysis tab
        // Cache the response
        if (analysisCacheKey) {
          setCachedData(analysisCacheKey, response.data);
        }
        message.success("Full analysis completed");
      }
    } catch (error) {
      console.error("Error analyzing policy:", error);
      message.error(error.data?.error || "Failed to analyze policy");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "blue";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          AI Assistant
        </h3>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          type="primary"
          icon={<Sparkles />}
          onClick={() => handleReview(false)}
          loading={isLoading}
          disabled={!policyText || policyText.length < 100}
        >
          {reviewData ? "View Review" : "Review Content"}
        </Button>
        {reviewData && (
          <Button
            icon={<RefreshCw />}
            onClick={() => handleReview(true)}
            loading={isLoading}
            size="small"
            title="Refresh review"
          >
            Refresh
          </Button>
        )}
        {policyId && (
          <>
            <Button
              onClick={() => handleFullAnalysis(false)}
              loading={isAnalyzing}
              icon={<CheckCircle />}
            >
              {analysisData ? "View Analysis" : "Full Analysis"}
            </Button>
            {analysisData && (
              <Button
                icon={<RefreshCw />}
                onClick={() => handleFullAnalysis(true)}
                loading={isAnalyzing}
                size="small"
                title="Refresh analysis"
              >
                Refresh
              </Button>
            )}
          </>
        )}
      </div>

      {/* Tabs for Review and Analysis */}
      {(reviewData || analysisData || isLoading || isAnalyzing) && (
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "review",
              label: (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Review {reviewData && isReviewCached && <Badge count="Cached" style={{ backgroundColor: '#52c41a', fontSize: '10px' }} />}
                </span>
              ),
              children: (
                <div className="mt-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <Spin size="large" />
                      <p className="mt-4 text-gray-600">Analyzing content...</p>
                    </div>
                  ) : reviewData ? (
                    <Card 
                      title={
                        <div className="flex items-center justify-between">
                          <span>Review Results</span>
                          {isReviewCached && (
                            <Badge 
                              count="Cached" 
                              style={{ backgroundColor: '#52c41a' }}
                              title="Results loaded from cache"
                            />
                          )}
                        </div>
                      }
                      className="prose prose-sm max-w-none"
                    >
                      {/* Quality Score */}
                      {reviewData.quality_score !== undefined && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-base">Quality Score</span>
                            <Badge
                              count={reviewData.quality_score}
                              style={{
                                backgroundColor:
                                  reviewData.quality_score >= 8
                                    ? "#52c41a"
                                    : reviewData.quality_score >= 6
                                    ? "#faad14"
                                    : "#ff4d4f",
                              }}
                            />
                          </div>
                          <Progress
                            percent={(reviewData.quality_score / 10) * 100}
                            strokeColor={
                              reviewData.quality_score >= 8
                                ? "#52c41a"
                                : reviewData.quality_score >= 6
                                ? "#faad14"
                                : "#ff4d4f"
                            }
                          />
                        </div>
                      )}

                      {/* Grammar Issues */}
                      {reviewData.grammar_issues?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2 text-base">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            Grammar Issues ({reviewData.grammar_issues.length})
                          </h4>
                          <div className="space-y-2">
                            {reviewData.grammar_issues.map((issue, idx) => (
                              <Alert
                                key={idx}
                                message={
                                  <div>
                                    <p className="font-medium text-base">{issue.text}</p>
                                    {issue.suggestion && (
                                      <p className="text-base text-gray-600 mt-1">
                                        Suggestion: {issue.suggestion}
                                      </p>
                                    )}
                                    {issue.location && (
                                      <p className="text-sm text-gray-500 mt-1">
                                        Location: {issue.location}
                                      </p>
                                    )}
                                  </div>
                                }
                                type="warning"
                                showIcon
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Compliance Issues */}
                      {reviewData.compliance_issues?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2 text-base">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            Compliance Issues ({reviewData.compliance_issues.length})
                          </h4>
                          <div className="space-y-2">
                            {reviewData.compliance_issues.map((issue, idx) => (
                              <Alert
                                key={idx}
                                message={
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Badge
                                        color={getSeverityColor(issue.severity)}
                                        text={issue.severity?.toUpperCase()}
                                      />
                                      {issue.standard && (
                                        <span className="text-base font-medium">
                                          {issue.standard}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-base">{issue.description}</p>
                                  </div>
                                }
                                type={issue.severity === "high" ? "error" : "warning"}
                                showIcon
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Clarity Suggestions */}
                      {reviewData.clarity_suggestions?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 text-base">Clarity Suggestions</h4>
                          <div className="space-y-2">
                            {reviewData.clarity_suggestions.map((suggestion, idx) => (
                              <Alert
                                key={idx}
                                message={
                                  <div>
                                    <p className="text-base">{suggestion.text}</p>
                                    {suggestion.suggestion && (
                                      <p className="text-base text-blue-600 mt-1">
                                        {suggestion.suggestion}
                                      </p>
                                    )}
                                  </div>
                                }
                                type="info"
                                showIcon
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Elements */}
                      {reviewData.missing_elements?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 text-base">Missing Elements</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {reviewData.missing_elements.map((element, idx) => (
                              <li key={idx} className="text-base text-gray-700">
                                {element}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Summary */}
                      {reviewData.summary && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-semibold mb-2 text-base">Summary</h4>
                          <p className="text-base text-gray-700">{reviewData.summary}</p>
                        </div>
                      )}
                    </Card>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No review data available. Click "Review Content" to get started.</p>
                    </div>
                  )}
                </div>
              ),
            },
            ...(policyId ? [{
              key: "analysis",
              label: (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Analysis {analysisData && isAnalysisCached && <Badge count="Cached" style={{ backgroundColor: '#52c41a', fontSize: '10px' }} />}
                </span>
              ),
              children: (
                <div className="mt-4">
                  {isAnalyzing ? (
                    <div className="text-center py-8">
                      <Spin size="large" />
                      <p className="mt-4 text-gray-600">Analyzing document...</p>
                    </div>
                  ) : analysisData ? (
                    <Card 
                      title={
                        <div className="flex items-center justify-between">
                          <span>Full Document Analysis</span>
                          {isAnalysisCached && (
                            <Badge 
                              count="Cached" 
                              style={{ backgroundColor: '#52c41a' }}
                              title="Results loaded from cache"
                            />
                          )}
                        </div>
                      }
                      className="prose prose-sm max-w-none"
                    >
                      <div className="whitespace-pre-wrap text-base leading-relaxed">
                        {analysisData.analysis}
                      </div>
                      {analysisData.timestamp && (
                        <p className="text-xs text-gray-500 mt-4">
                          Analyzed: {new Date(analysisData.timestamp).toLocaleString()}
                        </p>
                      )}
                    </Card>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No analysis data available. Click "Full Analysis" to get started.</p>
                    </div>
                  )}
                </div>
              ),
            }] : []),
          ]}
        />
      )}
    </div>
  );
};

export default AIPanel;

