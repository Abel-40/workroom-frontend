import type { AiMode } from "@/types/aiWorkspace";

export interface TourStep {
  title: string;
  description: string;
  // data-tour attribute value of the element to spotlight -- null centers
  // the card with no scrim cutout (used for the opening step of each tour).
  target: string | null;
}

export const TOUR_LABELS: Record<AiMode, string> = {
  plan: "AI Planner walkthrough",
  assistant: "AI Assistant walkthrough",
  health: "AI Health Check walkthrough",
};

export interface ToolSummary {
  title: string;
  description: string;
  bullets: string[];
}

// Condensed copy for the Help Hub cards -- coarser than the step-by-step
// tour script (one bullet can cover 2-3 tour steps), matching how the
// design brief's help cards read as a quick reference rather than a replay
// of the full walkthrough.
export const TOUR_SUMMARY: Record<AiMode, ToolSummary> = {
  plan: {
    title: "AI Planner",
    description: "Turns a project and a short brief into a task plan you can review before it reaches the backlog.",
    bullets: [
      "Pick the project -- the modal lists only what you can access.",
      "Pick assignees -- scoped to that project's members.",
      "Set the maximum number of tasks the AI may create.",
      "Review each task, comment, regenerate, then save to the backlog.",
    ],
  },
  assistant: {
    title: "AI Assistant",
    description: "Answers scoped questions about a project, grounded in the Workroom pages you choose to attach.",
    bullets: [
      "Pick the project the assistant should answer about.",
      "Attach pages from a folder to ground the answer in real content.",
      "Ask your question -- earlier ones stay visible for context.",
      "Save any answer back to the Info Portal as a page.",
    ],
  },
  health: {
    title: "AI Health Check",
    description: "Builds a progress summary and risk rating from a project's real, current task data.",
    bullets: [
      "Pick the project to check.",
      "Generate a report -- progress and risk come from live task data.",
      "Download the report as a spreadsheet.",
    ],
  },
};

export const TOUR_STEPS: Record<AiMode, TourStep[]> = {
  plan: [
    {
      title: "This is the AI Planner",
      description: "Turns a project and a short brief into a task plan you can review before it reaches the backlog.",
      target: null,
    },
    {
      title: "Choose the project first",
      description: "This opens a modal with every project you can access. Sort or search, pick one, and it becomes the context for everything the AI generates on this page.",
      target: "planner-project",
    },
    {
      title: "Pick your assignees",
      description: "Only members eligible on the selected project are listed, grouped by department. The AI can only suggest someone from this pool -- it never invents an assignee.",
      target: "planner-assignees",
    },
    {
      title: "Set a task limit",
      description: "Cap how many tasks the AI is allowed to create in one pass. It will never return more than this number, no matter what it generates.",
      target: "planner-max-tasks",
    },
    {
      title: "Describe the work",
      description: "Write a short brief of the outcome you want. Once a project and assignees are locked in, Generate becomes available here.",
      target: "planner-composer",
    },
    {
      title: "Review the generated plan",
      description: "Each card is numbered in the AI's suggested order. Select one to inspect it, leave a comment, or change its assignee.",
      target: "planner-sequence",
    },
    {
      title: "Save to the backlog",
      description: "Nothing is created in Workroom until you save. If a task has an open comment, regenerate it first.",
      target: "planner-save",
    },
  ],
  assistant: [
    {
      title: "This is the AI Assistant",
      description: "Ask scoped questions about a project and get answers grounded in real Workroom content, not guesses.",
      target: null,
    },
    {
      title: "Choose a project",
      description: "The assistant only answers using data from the project you pick here.",
      target: "assistant-project",
    },
    {
      title: "Ground it in your pages",
      description: "Attach specific Info Portal pages so the assistant reads them before answering.",
      target: "assistant-pages",
    },
    {
      title: "Ask your question",
      description: "Type what you want to know and send it -- earlier questions stay visible above for context.",
      target: "assistant-composer",
    },
    {
      title: "Answers show their sources",
      description: "Every answer lists the pages and links it drew from, so you always know where it came from.",
      target: "assistant-response-area",
    },
    {
      title: "Keep track of past questions",
      description: "Every question asked on this project is saved here. Any answer can also be saved to the Info Portal as a page.",
      target: "assistant-history",
    },
  ],
  health: [
    {
      title: "This is AI Health Check",
      description: "Generates a narrative summary and risk rating for a project, built only from its real task data.",
      target: null,
    },
    {
      title: "Choose a project",
      description: "Pick the project to check -- the report always reflects that project's live tasks and progress.",
      target: "health-project",
    },
    {
      title: "Read the report",
      description: "Progress, task counts, and the AI's risk rating are shown together, with the full task list below.",
      target: "health-report",
    },
    {
      title: "Generate the report",
      description: "This is the only action here -- Health Check reads live task data and writes a report, it doesn't hold a conversation.",
      target: "health-composer",
    },
    {
      title: "Download the report",
      description: "Export the current report as a real spreadsheet you can share outside Workroom.",
      target: "health-download",
    },
  ],
};
