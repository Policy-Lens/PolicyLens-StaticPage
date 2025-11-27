import { Typography, Space, Card } from "antd";
import QuestionSection from "./QuestionnaireComponents/QuestionSection";
import IssueSection from "./QuestionnaireComponents/IssueSection";

const { Title, Text } = Typography;

const Questionnaire = ({
  projectId,
  canEdit,
  onboardingData,
  questionsData,
  loadAllQuestions,
  issuesData,
  loadAllIssues,
}) => {
  return (
    <div>
      <Space
        direction="vertical"
        size="large"
        style={{ width: "100%", marginTop: 24 }}
      >
        {/* Section 1: Organization */}
        <QuestionSection
          title="Domain - Organization"
          domain="organization"
          questions={questionsData.organization}
          projectId={projectId}
          canEdit={canEdit}
          onboardingStatus={onboardingData?.status}
          loadAllQuestions={loadAllQuestions}
          maxQuestions={25}
        />

        {/* Section 2: Issue - Threat - Opportunities */}
        <Card>
          <Title level={5}>Issue - Threat - Opportunities</Title>
          <Space
            direction="vertical"
            size="small"
            style={{ width: "100%", marginTop: 16 }}
          >
            <IssueSection
              title="Internal Issues"
              category="internal"
              issues={issuesData.internal}
              projectId={projectId}
              canEdit={canEdit}
              onboardingStatus={onboardingData?.status}
              loadAllIssues={loadAllIssues}
              maxIssues={10}
            />
            <IssueSection
              title="External Issues"
              category="external"
              issues={issuesData.external}
              projectId={projectId}
              canEdit={canEdit}
              onboardingStatus={onboardingData?.status}
              loadAllIssues={loadAllIssues}
              maxIssues={10}
            />
            <IssueSection
              title="Risks and Threats"
              category="risk"
              issues={issuesData.risk}
              projectId={projectId}
              canEdit={canEdit}
              onboardingStatus={onboardingData?.status}
              loadAllIssues={loadAllIssues}
              maxIssues={10}
            />
            <IssueSection
              title="Opportunities"
              category="opportunity"
              issues={issuesData.opportunity}
              projectId={projectId}
              canEdit={canEdit}
              onboardingStatus={onboardingData?.status}
              loadAllIssues={loadAllIssues}
              maxIssues={10}
            />
          </Space>
        </Card>

        {/* Section 3: IT/IT Enabled */}
        <QuestionSection
          title="IT/IT Enabled"
          domain="it"
          questions={questionsData.it}
          projectId={projectId}
          canEdit={canEdit}
          onboardingStatus={onboardingData?.status}
          loadAllQuestions={loadAllQuestions}
          maxQuestions={15}
        />

        {/* Section 4: People */}
        <QuestionSection
          title="People"
          domain="people"
          questions={questionsData.people}
          projectId={projectId}
          canEdit={canEdit}
          onboardingStatus={onboardingData?.status}
          loadAllQuestions={loadAllQuestions}
          maxQuestions={5}
        />

        {/* Section 5: Physical */}
        <QuestionSection
          title="Physical"
          domain="physical"
          questions={questionsData.physical}
          projectId={projectId}
          canEdit={canEdit}
          onboardingStatus={onboardingData?.status}
          loadAllQuestions={loadAllQuestions}
          maxQuestions={5}
        />
      </Space>
    </div>
  );
};

export default Questionnaire;
