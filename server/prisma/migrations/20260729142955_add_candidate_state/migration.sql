-- CreateTable
CREATE TABLE "CandidateState" (
    "id" TEXT NOT NULL,
    "candidatePhone" TEXT NOT NULL,
    "candidateName" TEXT,
    "candidatePath" TEXT,
    "profile" JSONB,
    "eligibilityResults" JSONB,
    "writtenSubscriptions" JSONB,
    "ssbSubscription" TEXT,
    "ssbRegistration" JSONB,
    "aiUsage" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateState_candidatePhone_key" ON "CandidateState"("candidatePhone");
