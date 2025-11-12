import React, { useState } from "react";
import { Sparkles, CheckCircle, AlertCircle, X, Loader2 } from "lucide-react";
import { Button, Card, Spin, Alert, Progress, Badge } from "antd";
import { apiRequest } from "../../utils/api";
import { message } from "antd";

const AIPanel = ({ policyId, policyText, policyType = "Information Security" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const handleReview = async () => {
    if (!policyText || policyText.trim().length < 100) {
      message.warning("Please add more content before requesting AI review");
      return;
    }

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
        message.success("AI review completed");
      }
    } catch (error) {
      console.error("Error getting AI review:", error);
      message.error(error.data?.error || "Failed to get AI review");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullAnalysis = async () => {
    if (!policyId) {
      message.warning("Policy ID is required for full analysis");
      return;
    }

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
      <div className="flex gap-2">
        <Button
          type="primary"
          icon={<Sparkles />}
          onClick={handleReview}
          loading={isLoading}
          disabled={!policyText || policyText.length < 100}
        >
          Review Content
        </Button>
        {policyId && (
          <Button
            onClick={handleFullAnalysis}
            loading={isAnalyzing}
            icon={<CheckCircle />}
          >
            Full Analysis
          </Button>
        )}
      </div>

      {/* Review Results */}
      {isLoading && (
        <div className="text-center py-8">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Analyzing content...</p>
        </div>
      )}

      {reviewData && !isLoading && (
        <Card title="Review Results" className="mt-4">
          {/* Quality Score */}
          {reviewData.quality_score !== undefined && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Quality Score</span>
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
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Grammar Issues ({reviewData.grammar_issues.length})
              </h4>
              <div className="space-y-2">
                {reviewData.grammar_issues.map((issue, idx) => (
                  <Alert
                    key={idx}
                    message={
                      <div>
                        <p className="font-medium">{issue.text}</p>
                        {issue.suggestion && (
                          <p className="text-sm text-gray-600 mt-1">
                            Suggestion: {issue.suggestion}
                          </p>
                        )}
                        {issue.location && (
                          <p className="text-xs text-gray-500 mt-1">
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
              <h4 className="font-semibold mb-2 flex items-center gap-2">
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
                            <span className="text-sm font-medium">
                              {issue.standard}
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{issue.description}</p>
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
              <h4 className="font-semibold mb-2">Clarity Suggestions</h4>
              <div className="space-y-2">
                {reviewData.clarity_suggestions.map((suggestion, idx) => (
                  <Alert
                    key={idx}
                    message={
                      <div>
                        <p className="text-sm">{suggestion.text}</p>
                        {suggestion.suggestion && (
                          <p className="text-sm text-blue-600 mt-1">
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
              <h4 className="font-semibold mb-2">Missing Elements</h4>
              <ul className="list-disc list-inside space-y-1">
                {reviewData.missing_elements.map((element, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    {element}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          {reviewData.summary && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">Summary</h4>
              <p className="text-sm text-gray-700">{reviewData.summary}</p>
            </div>
          )}
        </Card>
      )}

      {/* Full Analysis Results */}
      {analysisData && (
        <Card title="Full Document Analysis" className="mt-4">
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm">
              {analysisData.analysis}
            </pre>
          </div>
          {analysisData.timestamp && (
            <p className="text-xs text-gray-500 mt-4">
              Analyzed: {new Date(analysisData.timestamp).toLocaleString()}
            </p>
          )}
        </Card>
      )}
    </div>
  );
};

export default AIPanel;

