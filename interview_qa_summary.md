# Ultimate Generative AI Interview Guide 2026 - Q&A Summary

## Python Questions

**Q1: What are Python's basic data types?**
- Integers (whole numbers like 1, 2, 10)
- Floats (decimal numbers like 2.5, 3.14)
- Strings (text wrapped in quotes, e.g., "data")
- Lists (ordered mutable collection, e.g., [1, 2, 3])
- Tuples (ordered immutable collection, e.g., (1, 2, 3))
- Dictionaries (key-value pairs, e.g., {"name": "Alice"})
- Sets (unordered collection of unique items)

**Q2: What is the difference between lists and tuples?**
- Lists are mutable - you can change content after creation by adding, deleting, or modifying elements
- Tuples are immutable - once created, elements cannot be changed
- Tuples are faster to access and safer to use as dictionary keys or set elements

**Q3: How can you concatenate two lists in Python?**
- Using the `+` operator: creates a new combined list (simple but uses more memory)
- Using the `.extend()` method: modifies the first list in place (memory efficient)

**Q4: What is the difference between a for loop and a while loop in Python?**
- For loop: runs a fixed number of times, ideal when you know iterations in advance
- While loop: runs until a condition becomes false, suitable for dynamic conditions

**Q5: How do you floor a number in Python?**
- Use `math.floor()` from the math module
- Rounds down to the nearest integer not greater than the original number
- Handles both positive and negative numbers correctly

**Q6: What is the difference between slash (/) and double slash (//) operator in Python?**
- `/` (slash): always returns a floating-point result
- `//` (double slash): performs floor division, returns the largest integer less than or equal to the result

**Q7: Can we pass a function as an argument in Python?**
- Yes, functions can be treated like variables
- You can pass a function into another function as an argument
- Enables flexible APIs and callbacks

**Q8: What is a lambda function?**
- A one-line anonymous function
- Useful for small operations passed inline
- Commonly used in sorting keys, map, or filter functions

**Q9: What is list comprehension? Give an example.**
- Allows building lists in single readable expressions
- Applies an operation to every element in an iterable
- Often replaces loops for cleaner, faster code

**Q10: What are *args and **kwargs?**
- `*args`: allows any number of positional arguments packed as a tuple
- `**kwargs`: allows any number of keyword arguments packed as a dictionary
- Helps write functions that accept variable arguments dynamically

**Q11: What is the difference between a set and a dictionary?**
- Sets: unordered collection of unique values only, no duplicates, no keys
- Dictionaries: store key-value pairs and allow fast retrieval via keys

**Q12: What is a docstring in Python?**
- The official way to document Python functions, classes, or modules
- Accessible via `help()` or `.__doc__`

**Q13: How is exception handling done in Python?**
- Using try-except blocks to catch errors and handle them gracefully
- Finally block runs cleanup code regardless of exceptions

**Q14: What is the difference between shallow copy and deep copy?**
- Shallow copy: makes a new outer object, but inner objects are still references to originals
- Deep copy: clones the outer and all inner objects recursively, changes don't affect originals

**Q15: What is a decorator in Python?**
- A function that takes another function and returns a new function
- Modifies or enhances behavior without changing the original function's internal code
- Used for reusable code like logging, timing, or authentication

**Q16: What is the difference between range and xrange?**
- Python 3 uses `range` which behaves like Python 2's `xrange` (creates an iterator)
- Python 2's `range` creates a list (uses more memory)

**Q17: What is inheritance in Python?**
- Allows one class (child/derived) to inherit attributes and methods from another class (parent/base)
- Promotes code reuse and creates hierarchical relationships between classes

**Q18: What are the types of inheritance supported in Python?**
- Single inheritance: one child inherits from one parent
- Multiple inheritance: one child inherits from multiple parents
- Multi-level inheritance: inheritance forms a chain
- Hierarchical inheritance: multiple children inherit from one parent
- Hybrid inheritance: combination of multiple types

**Q19: What is method overriding in Python?**
- When a child class provides a new implementation for a method already defined in its parent class
- Allows polymorphic behavior where the same method call can have different implementations

**Q20: What is the use of super function in Python?**
- Returns a temporary object of the parent class
- Used to call the parent's method inside a child class
- Useful when overriding methods to extend parent functionality without explicitly naming the parent class

---

## Statistics and Probability Questions

**Q1: What is Bayesian inference and the Monty Hall paradox?**
- Monty Hall problem: 3 doors, 1 car, 2 goats. After selecting a door, host opens another door revealing a goat and offers switch
- Switching provides 2/3 probability of winning (not 50-50)
- Uses Bayesian theorem to update probabilities based on new evidence
- Host's action is not random - constrained by initial choice and car location

**Q2: What is Poisson versus binomial distribution dilemma?**
- Binomial distribution: models number of successes in fixed number of independent trials with constant probability
- Poisson distribution: models number of events in fixed interval of time/space with known constant mean rate
- Poisson is the limit of binomial as N becomes very large and P becomes very small (NP = λ)

**Q3: What is central limit theorem and statistical robustness?**
- CLT states that sampling distribution of sample means approaches normal distribution as sample size increases
- Regardless of population's original distribution (provided variance is finite)
- Enables calculation of P-values and confidence intervals for metrics even when data is skewed

**Q4: What is the difference between stratified sampling and variance reduction?**
- Simple Random Sampling (SRS): every member has equal chance, but can have high variance with heterogeneous populations
- Stratified sampling: divides population into non-overlapping subgroups (strata) based on characteristics, then samples randomly from each
- Stratified sampling ensures representation and reduces standard error by blocking variance of stratifying variables

**Q5: Explain the law of large numbers and the gambler's fallacy.**
- Law of Large Numbers: as number of trials increases, sample average converges to expected value
- Gambler's fallacy: mistaken belief that if an event occurred more frequently, it's due to happen less frequently to balance the average
- Key distinction: independence - in independent trials, next outcome is entirely independent of the past

**Q6: P values and the null hypothesis significance testing (NHST) framework.**
- P value: probability of observing a test statistic as extreme or more extreme than calculated, assuming null hypothesis (H0) is true
- Not the probability that H0 is true, nor probability that observed effect is due to chance
- If P value < significance level α (typically 0.05), reject H0 in favor of alternative hypothesis (HA)

**Q7: What is the difference between type one and type two errors and the trade-off of power?**
- Type one error (α): false positive - rejecting a true null hypothesis
- Type two error (β): false negative - failing to reject a false null hypothesis
- Statistical power (1-β): probability of correctly detecting a true effect
- Trade-off depends on cost of each error in the specific context

**Q8: What is the difference between confidence interval and prediction intervals in forecasting?**
- Confidence interval: range for a mean of a population parameter with certain confidence level (e.g., 95%)
- Prediction interval: range for an individual future observation
- PI is always wider than CI because it accounts for both uncertainty in estimating mean and natural variance of individual data points

**Q9: How to determine sample size for A/B testing?**
- Based on relationship between Minimum Detectable Effect (MDE), significance level (α), and power (1-β)
- Smaller MDE requires larger sample size to distinguish signal from noise
- Formula derived from requirement that distribution of null and alternative hypothesis overlap by no more than α and β

**Q10: What is the difference between parametric and non-parametric testing?**
- Parametric tests (t-test, ANOVA): assume data follows specific distribution, generally more powerful
- Non-parametric tests: make no distribution assumptions, used for small samples or highly non-normal data
- Non-parametric tests are more robust to outliers but have less statistical power

**Q11: Explain the bias-variance trade-off and model complexity.**
- High bias (underfitting): model too simple, misses underlying patterns
- High variance (overfitting): model too complex, learns noise in training data
- Goal: find sweet spot where both bias and variance are minimized
- Techniques: cross-validation to detect overfitting, regularization to penalize complexity

**Q12: What is the difference between L1 and L2 regularization?**
- L1 (Lasso): adds absolute value of coefficients (λΣ|wi|), can force coefficients to zero (feature selection)
- L2 (Ridge): adds squared coefficients (λΣwi²), shrinks coefficients toward zero but rarely to zero (handles multicollinearity)

**Q13: What is Simpson's paradox and dangers of aggregation?**
- Simpson's paradox: trend appears in multiple subgroups but disappears or reverses when groups are combined
- Caused by confounding variables (e.g., treatment disproportionately given to harder cases)
- Solution: always segment data and check for class imbalance before drawing conclusions

**Q14: What is Berkson's paradox and selection bias?**
- Berkson's paradox (collider bias): two independent variables appear negatively correlated when sampling is limited to specific subset
- Example: hospital patients with COVID-19 seem less likely to be smokers because hospitalization is a collider
- Solution: ensure sample is representative of general population, not just truncated subset

**Q15: What is imputation and the theory of missing data?**
- Three types of missingness:
  - MCAR (Missing Completely At Random): probability same for all observations - safe to delete
  - MAR (Missing At Random): probability related to observed data - can predict and impute
  - MNAR (Missing Not At Random): probability depends on missing value itself - most dangerous, requires modeling
- Avoid simple imputation like mean filling - use KNN or multiple imputation by chained equations

---

## Machine Learning Questions

**Q1: Why do we take the harmonic mean of precision and recall when finding the F1 score?**
- Harmonic mean penalizes extreme values more than arithmetic mean
- Ensures F1 score gives equal weight to precision and recall
- Provides balanced evaluation when one metric is significantly lower than the other

**Q2: What is the purpose of activation functions in neural networks?**
- Introduces non-linearity to neural networks
- Allows learning of complex patterns and relationships
- Without activation functions, neural networks reduce to linear models
- Popular functions: sigmoid, tanh, ReLU

**Q3: If you don't know whether your data is scaled, out of random forest and logistic regression, which would you use?**
- Random forest - less impacted by feature scaling due to ensemble nature
- Logistic regression is sensitive to feature scale
- Random forest builds decision trees independently; scaling doesn't influence splitting decisions

**Q4: In cancer identification, which metric would you compromise on: precision or recall?**
- Prioritize recall over precision
- Maximizing recall ensures model correctly identifies as many positive cases as possible
- False negatives in cancer identification have severe consequences

**Q5: How does skewness in the distribution affect ML model performance?**
- Bias in model performance: models biased toward majority class
- Impact on algorithms: decision boundaries biased toward dominant class
- Prediction errors: inflated accuracy metrics by predicting majority class

**Q6: Explain the difference between Lasso and Ridge regularization.**
- Lasso (L1): adds absolute values, encourages sparse feature selection, drives coefficients to zero
- Ridge (L2): adds squared values, discourages large coefficients but rarely leads to sparsity

**Q7: Explain Bayesian optimization in hyperparameter tuning.**
- Iterative model-based optimization using probabilistic models
- Unlike grid/random search, considers information from previous iterations
- More efficient, requires fewer evaluations, suitable for computationally expensive models

**Q8: What is the significance of out-of-bag (OOB) error?**
- Valuable metric in ensemble methods, particularly bagging
- Measures model performance on instances not included in bootstrap sampling during training
- Unbiased estimation of generalization error, eliminates need for separate validation set

**Q9: Explain the connection between bagging and no free lunch theorem.**
- No free lunch theorem: no single ML algorithm performs best across all possible datasets
- Bagging embraces diversity by creating multiple models using different data subsets
- Practical implementation acknowledging different subsets may require different models

**Q10: Explain the difference between hard and soft voting in boosting algorithms.**
- Hard voting: each model makes prediction, final by majority voting
- Soft voting: each model provides probability estimation, final based on average/weighted average of probabilities

**Q11: How does choice of weak learners affect boosting model performance?**
- Decision stumps (shallow trees): computationally inexpensive, prone to underfitting, suitable for boosting
- More complex weak learners: may lead to overfitting, degrade generalization
- Balance between simplicity and complexity is crucial

**Q12: Differentiate between feature selection and feature extraction.**
- Feature selection: uses subset of most relevant features from original set (filter, wrapper, embedded methods)
- Feature extraction: transforms original features into new set of lower dimensionality (PCA, t-SNE)

**Q13: How can cross-validation help improve model performance?**
- Assesses how well model generalizes to new data
- Involves splitting data into multiple subsets, training on different folds, validating on remaining
- Provides robust estimation, helps identify overfitting, guides hyperparameter tuning

**Q14: Differentiate between feature scaling and feature normalization.**
- Feature scaling: general term for standardizing/transforming scale to consistent range (min-max, z-score, robust scaling)
- Feature normalization: transforms to standard normal distribution (mean=0, std=1), a specific type of scaling

**Q15: Explain pruning during training vs. pruning after training.**
- During training: grown to full depth, unnecessary branches pruned based on criteria (reduces overfitting, efficient training)
- After training: allowed to grow without restrictions, pruning applied afterwards (may improve accuracy but can overfit)

**Q16: What is grid search CV?**
- Hyperparameter tuning technique
- Systematically searches through predefined hyperparameter grid
- Performs cross-validation for each combination
- Exhaustively tests all possible combinations to find optimal set

**Q17: What is false positive and false negative?**
- False positive: model predicts positive class incorrectly (identifies negative instance as positive)
- False negative: model predicts negative class incorrectly (fails to identify positive instance)
- Significance depends on context and cost of misclassification

**Q18: What is PCA and can it be used for selecting features?**
- Dimensionality reduction technique transforming high-dimensional data to lower-dimensional space
- Identifies principal components (linear combinations of original features)
- Indirectly performs feature selection by highlighting most informative components
- May not be best when interpretability of individual features is crucial

**Q19: The model has high bias and low variance. How would you deal with it?**
- Increase model complexity (move from linear to non-linear)
- Feature engineering (introduce additional relevant features)
- Reduce regularization parameters
- Use ensemble methods
- Hyperparameter tuning

**Q20: What is the interpretation of ROC AUC?**
- AUC = 1: perfect classifier
- AUC = 0.5: performs no better than random chance
- AUC > 0.5: performs better than random chance
- Higher AUC indicates better discrimination ability

---

## Deep Learning Questions

**Q1: What is the fundamental difference between traditional ML and deep learning?**
- Traditional ML: depends on manual feature engineering (domain experts decide what information to extract)
- Deep learning: learns representations automatically from raw data (pixels, tokens, waveforms)
- Deep learning shines with unstructured, high-dimensional data (images, speech, NLP)
- Traditional ML often better for small, structured tabular data (more interpretable, less computational cost)

**Q2: What is the structure of an artificial neural network and how do forward and backward propagation work?**
- Structure: input layer (receives raw features), hidden layers (transformation), output layer (produces prediction)
- Forward propagation: data flows left to right, network transforms input into new representation
- Backpropagation: computes how much each weight contributed to loss using chain rule, moves backward
- Optimizer (SGD, Adam) updates weights opposite to gradient direction

**Q3: Why initializing all weights to zero is a catastrophic mistake?**
- All neurons start identically, produce exact same output
- Gradients are identical, all neurons updated in same way
- Entire layer collapses to behavior of single neuron
- Random initialization solves by giving each neuron different starting weights

**Q4: What is the difference between sigmoid, tanh, and ReLU activation functions?**
- Sigmoid: outputs between 0 and 1, good for binary classification, suffers from vanishing gradients
- Tanh: outputs between -1 and 1, zero-centered, also suffers from vanishing gradients
- ReLU: outputs max(0, x), doesn't suffer from vanishing gradients, computationally efficient, but can have dead neurons

**Q5: What is the vanishing gradient problem and how do modern architectures address it?**
- Gradients become extremely small as they backpropagate through many layers
- Prevents early layers from learning effectively
- Solutions: ReLU activation (doesn't saturate for positive values), residual connections (skip connections), batch normalization, careful initialization

**Q6: What is the difference between RNN, LSTM, and GRU?**
- RNN: basic recurrent network, processes sequences step by step, suffers from vanishing gradients
- LSTM: adds gating mechanisms (forget, input, output gates) to control information flow, handles long sequences better
- GRU: simplified LSTM with fewer gates (update and reset), computationally more efficient

**Q7: Why do CNNs use convolutional layers instead of fully connected layers for images?**
- Convolutional layers: sparse connectivity, parameter sharing, translation invariance
- Capture local patterns (edges, textures) efficiently
- Reduce parameter count dramatically compared to fully connected layers
- Hierarchical feature learning (simple patterns in early layers, complex in deeper layers)

**Q8: What is the role of 1x1 convolutions in architectures like ResNet and Inception?**
- Not about spatial feature extraction
- Used for channel mixing, projection, and efficiency
- Can reduce or increase number of channels
- Dramatically reduce computation and parameter count while preserving representational power

**Q9: Why do LSTMs use both sigmoid and tanh?**
- Sigmoid (outputs 0-1): used for gates (forget, input, output) - acts as soft switch to control information flow
- Tanh (outputs -1 to 1): used for candidate memory content and scaling cell state - allows balanced positive/negative updates
- Sigmoid decides how much information passes, tanh decides what kind of content is added/transformed

**Q10: What is teacher forcing and what is exposure bias?**
- Teacher forcing: using ground truth token as next input during training instead of model's prediction
- Advantage: stabilizes learning, makes training faster
- Exposure bias: mismatch between training (has access to ground truth) and inference (relies on own predictions)
- Can hurt robustness at inference time when small mistakes snowball

**Q11: What limitation did sequence-to-sequence LSTM have and how did attention fix it?**
- Seq2Seq limitation: compressed entire input into single fixed-length vector (information bottleneck)
- Attention: allows decoder to look back at all encoder hidden states while generating each output token
- Computes attention scores over input positions, dynamically builds context vector based on most relevant tokens
- Made long sequence modeling far more effective, foundation for transformers

**Q12: Why do we divide attention score by square root of dK?**
- Numerical stability
- As dimensionality increases, dot product grows larger in magnitude
- Large dot product makes softmax extremely sharp (one position gets almost all probability)
- Dividing by √dK scales dot product back to reasonable range, prevents softmax saturation, keeps gradients healthy

**Q13: Why is multi-head attention better than single-head attention?**
- Single head can learn one kind of relationship
- Language contains many different kinds of relationships (local/syntactic, long-range/semantic, conferences, sentiment, topic flow)
- Multi-head: projects input into multiple subspaces, runs separate attention operations in parallel
- Each head specializes in different patterns, outputs concatenated and linearly projected

**Q14: Why do transformers need positional encoding and what is the difference between sinusoidal and learned positional embeddings?**
- Transformers process tokens in parallel, have no built-in notion of order
- Without positional info, would treat sequence as bag of tokens
- Sinusoidal: fixed sine/cosine functions at different frequencies, parameter-free, generalizes to longer lengths
- Learned: trainable embedding vectors for each position, more flexible, works well when max length is known

**Q15: What is the difference between pre-layer normalization and post-layer normalization in transformers?**
- Post-layer: residual connection added first, then layer normalization applied
- Pre-layer: input normalized first before sublayer, residual connection bypasses sublayer output
- Pre-layer makes residual pathway cleaner, helps gradient flow more reliably in very deep models
- Most modern LLMs favor pre-layer for optimization stability

---

## RAG (Retrieval-Augmented Generation) Questions

**Q1: What is retrieval-augmented generation and why has it become important?**
- Architecture connecting LLM to external knowledge base at generation time
- First retrieves relevant information from sources (documents, databases, knowledge bases)
- Then uses that material to generate answer
- Important because LLM knowledge can be outdated, incomplete, disconnected from private enterprise data
- Provides fresh, domain-specific, traceable information

**Q2: What are the two core components of RAG system?**
- Retriever: finds relevant information from external knowledge source (vector database, keyword index, search engine, hybrid stack)
- Generator: the language model that uses retrieved context to produce final answer
- Retriever finds evidence, generator turns evidence into useful response

**Q3: Differentiate between sparse retrieval, dense retrieval, and hybrid retrieval.**
- Sparse retrieval: matches exact terms (BM25), great when wording matters (product names, IDs, legal clauses)
- Dense retrieval: converts query and document to embeddings, retrieves based on semantic similarity
- Hybrid retrieval: combines both - sparse for lexical precision, dense for semantic recall

**Q4: What are HNSW and IVF, and what trade-offs do they introduce?**
- HNSW (Hierarchical Navigable Small World): builds graph structure, strong recall, low-latency, but memory-intensive and operationally expensive
- IVF (Inverted File): groups vectors into clusters, searches within relevant ones, more scalable and storage-efficient, but recall can drop if clustering not well-tuned
- Decision depends on latency, scale, memory, and update requirements

**Q5: What are parent document retrieval and sentence window retrieval?**
- Parent document: embed smaller child chunks for precise retrieval, return larger parent section for fuller context
- Sentence window: retrieves specific sentence, expands context by pulling nearby sentences
- Balance between chunk size - too big = noisy retrieval, too small = lost context

**Q6: What is lost in the middle problem and how do teams reduce it?**
- Long context models pay more attention to information at beginning/end than middle
- Relevant documents can be retrieved but still produce weak answer if important info ends up in wrong position
- Solutions: reranking (push relevant chunks higher), context pruning, better prompt construction

**Q7: How does HyDE improve zero-shot retrieval?**
- HyDE (Hypothetical Document Embeddings): LLM generates hypothetical answer/document based on query
- Embeds hypothetical document instead of original short question
- Hypothetical document captures right vocabulary, concepts, semantic directions
- Acts as semantic bridge between user intent and real documents in database

**Q8: What pre-retrieval techniques are used to improve complex queries?**
- Query reformulation: rewrites vague/messy question into retrieval-friendly form
- Context integration: uses conversation history to resolve references (e.g., "previous one")
- Structured preprocessing: entity extraction, metadata filters, date constraints, keyword routing
- Better queries lead to better retrieval, which leads to better answers

**Q9: What is the difference between standard RAG, corrective RAG, and self-RAG?**
- Standard RAG: retrieve documents, pass to model, generate answer (simple but if retrieval is weak, answer can be wrong)
- Corrective RAG (CRAG): adds validation step after retrieval, evaluates if results are good enough, triggers fallback if not
- Self-RAG: model actively evaluates usefulness of retrieved info, decides whether to retrieve again, refine reasoning, revise output

**Q10: What is agentic RAG?**
- Retrieval becomes part of larger decision-making loop instead of fixed pipeline step
- LLM acts as orchestrator: decides whether to retrieve, which tool/source to use, whether results are sufficient
- More flexible for complex workflows with multiple tools (vector search, SQL, web search, code execution)
- Upside: power. Downside: complexity (latency, observability, control harder)

**Q11: How does graph RAG differ from traditional vector RAG?**
- Traditional vector RAG: retrieve based on embedding similarity
- Graph RAG: turns information into graph (entities as nodes, relationships as edges)
- Allows reasoning over connections, not just similarity
- Useful for multi-hop reasoning, relationship-heavy questions, broad sense-making

**Q12: Are long context models making RAG obsolete?**
- No. Long context is powerful but doesn't eliminate need for retrieval
- Enterprise knowledge changes constantly, documents are massive
- RAG helps with freshness, cost control, selective context construction, source traceability
- Best setup often uses both: retrieval finds right evidence, long context gives room to reason

**Q13: How are RAG systems evaluated?**
- Two stages: retrieval evaluation and generation evaluation
- Retrieval: whether system pulls relevant context, important evidence ranked high enough (precision, recall, ranking quality)
- Generation: whether answer is grounded in evidence, correct, fully addresses intent
- Frameworks like RagEx help with automated metrics (faithfulness, answer quality)
- Strong teams use both metrics and human review

**Q14: How do you optimize a RAG system for both accuracy and latency?**
- Retrieval efficiency: better indexing, ANN search, metadata filtering, candidate narrowing
- Caching: semantic caching for repeated/similar questions
- Context compression: smaller model summarizes/filters documents before final generation
- Pipeline design: cheap filtering early, expensive reasoning later

**Q15: What are the biggest red flags in RAG system design?**
- Treating failures like magic (diagnose retrieval quality, chunking, ranking, grounding)
- Designing only for demos (production needs access control, observability, source attribution, ingestion workflow)
- Ignoring evaluation (can't explain how to measure retrieval quality and answer faithfulness)
- Ignoring security and operational risk (prompt injection, stale indexes, bad data ingestion, permissions, monitoring)

---

## Agentic AI Questions

**Q1: What is the difference between agentic AI and traditional AI?**
- Traditional AI: reactive - give input, get output, interaction ends (response generation)
- Agentic AI: goal-oriented - tries to complete task, breaks into steps, calls tools, inspects results, continues until goal reached (task execution)
- Agentic systems feel like digital workers that take actions, interact with external systems, adapt step by step

**Q2: Explain Andrew Ng's four agentic design patterns.**
- Reflection: model reviews and improves its own output (built-in self-correction)
- Tool use: model can access external tools (web search, internal systems)
- Planning: model creates sequence of steps before starting execution
- Multi-agent collaboration: multiple specialized agents work together
- These patterns improve performance by improving orchestration around the model

**Q3: What is the ReAct framework?**
- ReAct = Reason + Act
- Cycle of three parts: Reasoning (identify what's needed), Action (choose and call tool), Observation (read tool result, update next move)
- Reduces blind guessing by gathering evidence step by step
- Makes workflow more grounded, traceable, and easier to debug

**Q4: What is the difference between system prompts and user prompts?**
- System prompt: defines high-level behavior (identity, tone, constraints, allowed tools, safety rules, formatting)
- User prompt: task-specific instruction (what user wants in particular interaction)
- Models treat system prompts as high priority
- System prompt is not perfect security boundary - real defenses need additional controls (tool restrictions, permissions, input filtering, output validation, human approval)

**Q5: How is reflection technically implemented?**
- Loop between generation and critique
- Stage 1: model produces initial answer/draft/plan/code
- Stage 2: review stage (same model with different prompt or separate critique model) checks against criteria
- Critique passed back to generator, produces revised version
- Cycle continues until output reaches acceptable quality, pass condition met, or max iterations reached

**Q6: How do tool use and function calling work?**
- Give model list of available tools with structured schema (name, description, required arguments, parameter types)
- Model decides whether to answer directly or call tool
- If tool needed, model returns structured tool call (e.g., call weather API with city=Mumbai)
- Application layer executes tool (model doesn't run API/query database itself)
- Result returned to model, model uses it to generate final answer
- Cycle: user query → model selects tools → app executes tool → result returns → model answers

**Q7: How are agentic memory systems engineered?**
- Working memory: recent conversations, current task state, recent tool output, plan (short-term context)
- Long-term memory: stores information outside prompt window (user preferences, previous solutions, recurring workflows, business rules)
- Common implementation: vector database (embedded and retrieved by similarity)
- Can also include structured databases, key-value stores, summary documents, metadata layers
- Goal: store right information, retrieve at right time, avoid overwhelming model with irrelevant context

**Q8: Describe multi-agent orchestration and routing.**
- Multiple specialized agents instead of one general-purpose agent (research, SQL, coding, reviewer)
- Orchestration/routing: who decides which agent handles which task
- Common setup: supervisor agent receives user goal, breaks into subtasks, assigns to suitable specialist
- Routing types: rule-based (if-else), semantic (match to agent whose domain is relevant), LLM-based (model decides)
- Strength: modularity - each agent can be improved independently

**Q9: Compare LangChain, LangGraph, AutoGen, and CrewAI.**
- LangChain: broad application framework for LLM-powered pipelines (prompts, retrieval, chains, tools, output parsers, integration)
- LangGraph: designed for stateful workflows with loops, branches, retries, explicit control flow (agent that can revisit steps, maintain state)
- AutoGen: known for agent-to-agent interaction (multi-agent conversational collaboration)
- CrewAI: focuses on role-based team collaboration (agents with roles, responsibilities, goals, coordinated as team)

**Q10: What are evals in agentic AI?**
- Testing and measurement layers for agent systems
- Measure multiple aspects: did agent choose correct tool? pass right arguments? follow intended workflow? was answer correct/grounded? stay within policy/safety rules?
- Common method: LLM as a judge (another model scores output using rubric)
- Combined with deterministic checks: schema validation, rule-based assertions, unit tests for tools, tool success rates, latency, cost tracking
- About measuring end-to-end task quality, decision quality, system reliability

**Q11: Explain tracing, spans, and observability.**
- Span: one individual unit of work (LLM call, database query, retriever step, API call)
- Trace: full sequence/tree of spans for request (shows entire execution path)
- Critical for debugging multi-step systems: know which step failed, what prompt led to wrong output, whether issue from retrieval/tool use/reasoning
- Makes agent systems debuggable, measurable, production ready

**Q12: What is the difference between text hallucination and functional hallucinations?**
- Text hallucination: model says something incorrect in natural language (wrong date, invented fact, misstated title)
- Functional hallucination: more dangerous - produces incorrect action or invalid system instruction (invents tool name, uses non-existent parameter, malformed JSON, calls wrong API endpoint)
- Text hallucination affects information quality, functional hallucination affects execution safety
- Mitigation for functional: strict schema validation, tool parameter checks, sandboxing, policy layers, human approval for high-risk actions

**Q13: How do you handle non-deterministic behavior?**
- Lower temperature (makes output more stable, but temperature zero doesn't guarantee perfect determinism)
- Enforce structured outputs (model must respond in schema/JSON format)
- Validation rules, retries, fallbacks, repeated benchmark runs
- Semantic scoring instead of exact match scoring, dataset-based evaluations
- Design systems that perform reliably even though model is probabilistic

**Q14: What are the risks of infinite loops and agent sprawl?**
- Infinite loops: agent keeps repeating steps without making progress (rethinking same problem, calling same tool repeatedly, agents passing task back and forth)
- Protection: max iteration limits, timeout limits, duplicate action detection, progress checks, explicit success/failure stopping rules
- Agent sprawl: organizational issue - many agents deployed without governance (lose track of ownership, permissions, tools, versions, safety)
- Mature organization addresses both through technical controls and centralized oversight

**Q15: What are the main security and deployment challenges?**
- Agent connected to tools, databases, APIs, code execution, business systems - failures have real-world consequences
- Risks: prompt injection, sensitive data leakage, over-permissioned tools, insecure code execution, malicious inputs, cross-system privilege escalation
- Production deployment requires: least privilege access, sandbox execution, audit logging, secret management, approval workflows, output filtering, human review for destructive/high-risk actions
- More capable agent = more important governance, access control, safety architecture

---

**Summary:**
- **Python**: 20 questions covering basics to OOP concepts
- **Statistics/Probability**: 15 questions on distributions, hypothesis testing, bias-variance
- **Machine Learning**: 20 questions on algorithms, evaluation, preprocessing
- **Deep Learning**: 15 questions on architectures, training techniques, transformers
- **RAG**: 15 questions on retrieval, indexing, evaluation, optimization
- **Agentic AI**: 15 questions on design patterns, architecture, production concerns

**Total: 100 interview questions** covering the complete stack for Generative AI interviews in 2026.
