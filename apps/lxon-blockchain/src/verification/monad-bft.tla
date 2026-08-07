--------------------------- MODULE MonadBFT ---------------------------
EXTENDS Naturals, Sequences, FiniteSets

CONSTANT Validators
CONSTANT MaxFaulty \in Nat
ASSUME Cardinality(Validators) > 3 * MaxFaulty

Vars == <<
  currentView,
  proposedBlocks,
  votes,
  timeouts,
  highTips,
  committedBlock,
  activeView
>>

Subset(v) == SUBSET v \* helper macro

--------------------------------------------------------------------
\* Safety: No two honest validators commit different blocks
Safety == 
  \A v1, v2 \in Validators:
    (v1 /= v2) =>
    (Committed(v1) /= []) => 
    (Committed(v2) /= []) =>
    (Committed(v1) = Committed(v2))

--------------------------------------------------------------------
\* Liveness: If a block is proposed with quorum, eventually commits
Liveness == 
  WF_Vars(Propose) /\ WF_Vars(Vote) /\ WF_Vars(Commit)

--------------------------------------------------------------------
\* Validity: Only proposed blocks can be committed
Validity ==
  \A v \in Validators:
    (Committed(v) /= []) =>
    (Committed(v) \in proposedBlocks)

--------------------------------------------------------------------
\* No tail-forking: High-tip recovery preserves previous proposals
NoTailForking ==
  \A v \in Validators:
    (highTips[v] /= []) =>
    (highTips[v] \in proposedBlocks)

--------------------------------------------------------------------
\* Quorum certificate validity: At least 2f+1 signatures
QuorumValid(cert) ==
  Cardinality(cert.signatures) >= 2 * MaxFaulty + 1

--------------------------------------------------------------------
\* Byzantine threshold: At most f faulty validators
ByzantineThreshold ==
  Cardinality({v \in Validators : Faulty(v)}) <= MaxFaulty

--------------------------------------------------------------------
\* Consensus state per validator
ConsensusState(v) ==
  [ currentView |-> currentView[v],
    proposedBlock |-> proposedBlocks[v],
    vote |-> votes[v],
    timeout |-> timeouts[v],
    highTip |-> highTips[v],
    committed |-> committedBlock[v]
  ]

--------------------------------------------------------------------
\* Init specification
Init ==
  /\ currentView \in [Validators -> 0]
  /\ proposedBlocks \in [Validators -> {}]
  /\ votes \in [Validators -> {}]
  /\ timeouts \in [Validators -> {}]
  /\ highTips \in [Validators -> {}]
  /\ committedBlock \in [Validators -> {}]
  /\ activeView \in [Validators -> FALSE]

--------------------------------------------------------------------
\* Propose action
Propose ==
  \E v \in Validators:
    \/ /\ ~activeView[v]
       /\ currentView[v] = currentView[v]
       /\ proposedBlocks[v] = proposedBlocks[v] \cup {Block(v, currentView[v])}
       /\ activeView[v] = TRUE
       /\ UNCHANGED <<currentView, votes, timeouts, highTips, committedBlock>>

--------------------------------------------------------------------
\* Vote action
Vote ==
  \E v1, v2 \in Validators:
    /\ activeView[v1]
    /\ currentView[v1] = currentView[v2]
    /\ proposedBlocks[v1] /= {}
    /\ QuorumValid([signatures |-> votes[v1]])
    /\ votes[v2] = votes[v2] \cup {v2}
    /\ UNCHANGED <<currentView, proposedBlocks, timeouts, highTips, committedBlock>>

--------------------------------------------------------------------
\* Commit action
Commit ==
  \E v \in Validators:
    /\ Cardinality(votes[v]) >= 2 * MaxFaulty + 1
    /\ proposedBlocks[v] /= {}
    /\ committedBlock[v] = Choose(proposedBlocks[v])
    /\ UNCHANGED <<currentView, proposedBlocks, votes, timeouts, highTips>>

--------------------------------------------------------------------
\* Timeout action for view failure
Timeout ==
  \E v \in Validators:
    /\ activeView[v]
    /\ ~(Cardinality(votes[v]) >= 2 * MaxFaulty + 1)
    /\ timeouts[v] = TRUE
    /\ highTips[v] = Choose(proposedBlocks[v])
    /\ activeView[v] = FALSE
    /\ UNCHANGED <<currentView, proposedBlocks, votes, committedBlock>>

--------------------------------------------------------------------
\* View recovery with high-tip
ViewRecovery ==
  \E v \in Validators:
    /\ timeouts[v]
    /\ Cardinality({v2 \in Validators : timeouts[v2]}) >= 2 * MaxFaulty + 1
    /\ currentView[v] = currentView[v] + 1
    /\ proposedBlocks[v] = {}
    /\ votes[v] = {}
    /\ timeouts[v] = FALSE
    /\ UNCHANGED <<highTips, committedBlock>>

--------------------------------------------------------------------
\* Next state relation
Next ==
  \/ Propose
  \/ Vote
  \/ Commit
  \/ Timeout
  \/ ViewRecovery

--------------------------------------------------------------------
\* Spec
Spec == Init /\ [][Next]_Vars

--------------------------------------------------------------------
\* Theorems
THEOREM Spec => []Safety
THEOREM Spec => []Validity
THEOREM Spec => []NoTailForking

=============================================================================
