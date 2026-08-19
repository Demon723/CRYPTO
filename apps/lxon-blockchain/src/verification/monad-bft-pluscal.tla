------------------------------- MODULE MonadBFTPlusCal -------------------------------
EXTENDS Naturals, Sequences, FiniteSets

CONSTANT Validators
CONSTANT MaxFaulty \in Nat
ASSUME Cardinality(Validators) > 3 * MaxFaulty

(* --algorithm MonadBFT

variables
  currentView = [v \in Validators |-> 0];
  proposedBlocks = [v \in Validators |-> {}];
  votes = [v \in Validators |-> {}];
  timeouts = [v \in Validators |-> FALSE];
  highTips = [v \in Validators |-> {}];
  committedBlock = [v \in Validators |-> {}];
  activeView = [v \in Validators |-> FALSE];

define
  QuorumValid(cert) ==
    Cardinality(cert.signatures) >= 2 * MaxFaulty + 1
  
  Safety ==
    \A v1, v2 \in Validators:
      (Committed(v1) /= []) /\ (Committed(v2) /= [])
        => Committed(v1) = Committed(v2)
  
  Liveness ==
    \E v \in Validators:
      WF_v(Propose) /\ WF_v(Vote) /\ WF_v(Commit)
end define;

process proposer \in Validators
begin
  Propose:
    while TRUE do
      await ~activeView[self];
      proposedBlocks[self] := proposedBlocks[self] \cup {Block(self, currentView[self])};
      activeView[self] := TRUE;
    end while;
end process;

process voter \in Validators
begin
  Vote:
    while TRUE do
      await activeView[self] /\ QuorumValid(votes[self]);
      votes[self] := votes[self] \cup {self};
    end while;
end process;

process committer \in Validators
begin
  Commit:
    while TRUE do
      await Cardinality(votes[self]) >= 2 * MaxFaulty + 1 /\ proposedBlocks[self] /= {};
      committedBlock[self] := Choose(proposedBlocks[self]);
    end while;
end process;

process timeoutWatcher \in Validators
begin
  Timeout:
    while TRUE do
      await activeView[self] /\ ~(Cardinality(votes[self]) >= 2 * MaxFaulty + 1);
      timeouts[self] := TRUE;
      highTips[self] := Choose(proposedBlocks[self]);
      activeView[self] := FALSE;
      
      await Cardinality({v \in Validators : timeouts[v]}) >= 2 * MaxFaulty + 1;
      currentView[self] := currentView[self] + 1;
      proposedBlocks[self] := {};
      votes[self] := {};
      timeouts[self] := FALSE;
    end while;
end process;

end algorithm *)

=============================================================================
