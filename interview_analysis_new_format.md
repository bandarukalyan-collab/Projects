# Video Transcript Analysis

## Overview
This is a comprehensive interview preparation video for Generative AI roles in 2026, covering 100 interview questions across the complete tech stack from Python basics to advanced Agentic AI concepts. The video is designed as a one-stop resource to make candidates interview-ready by covering Python, Statistics/Probability, Machine Learning, Deep Learning, RAG, and Agentic AI in a single sitting.

## Main Topics
- Python foundations (data types, loops, functions, OOP)
- Statistics & Probability (distributions, hypothesis testing, bias-variance)
- Machine Learning (F1 score, regularization, cross-validation, PCA)
- Deep Learning (neural networks, attention mechanisms, transformers)
- RAG (retrieval-augmented generation, indexing strategies)
- Agentic AI (design patterns, frameworks, production concerns)

## Key Points
- Python basics are critical - if you fumble foundations, nothing else matters
- Statistics is the filter where most people fail in interviews
- In 2025-2026, the value of data scientists shifts from writing code to validating logic
- Strong interview answers require mathematical intuition, architectural trade-offs, and engineering reasoning
- Production readiness separates demos from real systems (safety, governance, tracing)

## Technical Details
- Python: math.floor(), / vs //, lambda functions, list comprehensions, *args, **kwargs
- Statistics: CLT, P-values, Type I/II errors, confidence/prediction intervals, A/B testing
- ML: F1 harmonic mean, Lasso/Ridge regularization, OOB error, cross-validation, PCA
- Deep Learning: Xavier/He initialization, ReLU, scaled dot-product attention, positional encoding
- RAG: BM25, dense retrieval, HNSW/IVF, HyDE, lost in middle problem
- Agentic AI: ReAct framework, tool calling, memory systems, LangChain/LangGraph/AutoGen/CrewAI

## Notable Quotes
- "If you fumble the basics, nothing else matter"
- "Statistics and probability, the filter around most people fail"
- "Strong interview answers are not just about definitions. They are about understanding the mathematical intuition, the architectural trade-offs, and the engineering reason behind why these ideas exist"
- "Agentic AI is not just about better prompting. It is about designing systems that can plan, act, retrieve, validate, and adapt towards a goal"

---

# Q&A Extraction

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
- Tuples are faster to access and safer to use as dictionary keys or set elements since their hash value doesn't change over time

**Q3: How can you concatenate two lists in Python?**
- Using the `+` operator: creates a new combined list (simple but uses more memory because it copies elements)
- Using the `.extend()` method: modifies the first list in place by adding elements from another list (memory efficient when you don't need the original list intact)

**Q4: What is the difference between a for loop and a while loop in Python?**
- For loop: runs a fixed number of times, ideal when you know in advance how many iterations are needed, such as iterating over lists or ranges
- While loop: runs until a specified condition becomes false, suitable when the iteration depends on dynamic conditions, not knowing beforehand
- Misusing loops can cause infinite loops or prevent expected terminations

**Q5: How do you floor a number in Python?**
- Use `math.floor()` from the math module
- Flooring a number means rounding it down to the nearest integer, not greater than the original number
- Handles both positive and negative numbers correctly

**Q6: What is the difference between slash (/) and double slash (//) operator in Python?**
- `/` (slash): always returns a floating-point result, even when dividing integers
- `//` (double slash): performs floor division, returning the largest integer less than or equal to the result

**Q7: Can we pass a function as an argument in Python?**
- Yes, functions can be treated like variables in Python
- You can pass a function into another function as an argument
- Enables flexible APIs and callbacks

**Q8: What is a lambda function?**
- A one-line anonymous function
- Useful for small operations passed inline
- Commonly used in sorting keys, map, or filter functions

**Q9: What is list comprehension? Give an example.**
- Allows building lists in single readable expressions by applying an operation to every element in an iterable
- Often replaces loops for cleaner, faster code

**Q10: What are *args and **kwargs?**
- *args allows any number of positional arguments packed as tuple
- **kwargs allows any number of keyword arguments packed as dictionary
- They help write functions that accept variable arguments dynamically

**Q11: What is the difference between a set and a dictionary?**
- Sets are unordered collection of unique values only, no duplicates, no keys
- Dictionaries store key-value pairs and allow fast retrieval via keys

**Q12: What is a docstring in Python?**
- Docstrings are the official way to document Python functions, classes, or modules
- Accessible via help() or __doc__ attribute

**Q13: How is exception handling done in Python?**
- Using try-except blocks lets you catch errors and handle them gracefully
- Finally block runs cleanup code regardless of exception

**Q14: What is the difference between shallow copy and deep copy?**
- Shallow copy: makes a new outer object, but inner objects are still references to originals. Changes to nested objects affect both
- Deep copy: clones the outer and all inner objects recursively, so changes do not affect originals

**Q15: What is a decorator in Python?**
- A function that takes another function and returns a new function that modifies or enhances its behavior without changing the original function's internal code
- Helps add reusable code like logging, timing, or authentication

**Q16: What is the difference between range and xrange?**
- Python 3 uses range, which behaves like Python 2's xrange, creating an iterator that generates numbers on demand
- Python 2's range creates a list using more memory

**Q17: What is inheritance in Python?**
- Inheritance allows one class (child or derived class) to inherit attributes and methods from another class (parent or base class)
- Promotes code reuse and helps create hierarchical relationships between classes

**Q18: What are the types of inheritance supported in Python?**
- Single inheritance: one child inherits from one parent
- Multiple inheritance: one child inherits from multiple parents
- Multi-level inheritance: inheritance forms a chain where a child inherits from a parent which itself inherits from another parent
- Hierarchical inheritance: multiple children inherit from one parent class
- Hybrid inheritance: combination of multiple types of inheritance

**Q19: What is method overriding in Python?**
- Happens when a child class provides a new implementation for a method already defined in its parent class
- When the method is called on child instance, the child's version is used
- Allows polymorphic behavior where the same method call can have different implementations depending on the object

**Q20: What is the use of super function in Python?**
- Super returns a temporary object of parent class and is used to call the parent's method inside a child class
- Particularly useful when overriding methods to extend parent functionality without explicitly naming the parent class
- Supports multiple inheritance

---

## Statistics & Probability Questions

**Q1: What is Bayesian inference and the Monty Hall paradox?**
- Monty Hall problem: contestant chooses one of three doors (one has car, two have goats), host opens another door revealing a goat, offers chance to switch
- Switching provides 2/3 probability of winning because host's action is not random - it's constrained by initial choice and actual location of car
- Bayesian updating formalizes this: initial probability P(car) = 1/3 for any door. When Monty opens a door, the asymmetry in likelihood function shifts posterior probability to 2/3 for remaining door

**Q2: What is Poisson vs binomial distribution dilemma?**
- Binomial distribution: models number of successes in a fixed number of independent trials where each trial has constant probability of success
- Poisson distribution: models number of events occurring in a fixed interval of time or space assuming events occur with known constant mean rate lambda and independently
- Poisson limit theorem: binomial converges to Poisson as N becomes very large and P becomes very small such that NP = lambda
- Example: modeling users converting per day (binomial) vs server crashes per hour (Poisson)

**Q3: What is central limit theorem and statistical robustness?**
- CLT states that sampling distribution of sample means will approach a normal distribution as sample size increases regardless of population's original distribution provided variance is finite
- Enables making inferences about population parameters using standard normal distribution
- Allows calculation of P-values and confidence intervals for metrics like average revenue per user even when individual revenue data is highly skewed

**Q4: What is the difference between stratified sampling and variance reduction?**
- Simple random sampling (SRS): every member has equal chance of selection, but can suffer from high variance if population is heterogeneous
- Stratified sampling: divides population into non-overlapping subgroups (strata) based on specific characteristics, then samples randomly from each stratum
- Stratified sampling ensures representation and reduces standard error of estimate by ensuring each subgroup is adequately represented
- Particularly critical for imbalanced datasets where SRS might miss small but statistically significant subgroups

**Q5: Explain the law of large numbers and the gambler's fallacy.**
- Law of large numbers (LLN): as number of trials increases, sample average will converge to expected value
- Gambler's fallacy: mistaken belief that if an event has occurred more frequently than normal, it is due to happen less frequently in the future to balance the average
- Mathematical distinction is independence - in independent trials like coin flips, next outcome is entirely independent of the past
- LLN works not by correcting past results but by swamping them with massive number of new independent observations

**Q6: P-values and the null hypothesis significance testing (NHST) framework.**
- P-value: probability of observing a test statistic as extreme or more extreme than the one calculated from sample data assuming the null hypothesis H0 is true
- NOT the probability that the null hypothesis is true, NOR the probability that observed effect is due to chance
- A measure of evidence against H0. If P-value is below predetermined significance level alpha (typically 0.05), we reject H0 in favor of alternative hypothesis HA
- Multiple comparisons problem: performing many tests increases likelihood of type I error (false positive)

**Q7: What is the difference between type I and type II errors and the trade-off of power?**
- Type I error (alpha): false positive - rejecting a true null hypothesis
- Type II error (beta): false negative - failing to reject a false null hypothesis
- Statistical power (1 - beta): probability of correctly detecting a true effect
- Choice depends on cost: in spam detection, type I error (flagging important email as spam) is often more costly than type II error, leading to preference for higher precision over recall
- To increase power without increasing alpha, must increase sample size N

**Q8: What is the difference between confidence interval and prediction intervals in forecasting?**
- Confidence interval: provides a range for a mean of a population parameter with certain level of confidence (e.g., 95%)
- Prediction interval: provides a range for an individual future observation
- PI is always wider than CI because it must account for both uncertainty in estimating the mean and natural variance of individual data points
- In business: CI used to estimate average growth of a metric, PI used to set expectation for specific customer's future spend

**Q9: How to determine sample size for A/B testing?**
- Relationship between minimum detectable effect (MDE), significance level (alpha), and power (1 - beta)
- MDE: smallest change in a metric that is business relevant
- Smaller MDE requires larger sample size to distinguish signal from noise
- Use Python statsmodels for calculations to translate theory into engineering tools

**Q10: What is the difference between parametric and non-parametric testing?**
- Parametric tests (T-test, ANOVA): assume data follows specific distribution, generally more powerful
- Non-parametric tests: make no distribution assumptions, used for small samples or highly non-normal data
- Trade-off: non-parametric tests are more robust to outliers but have less statistical power
- Bootstrapping: resampling technique to estimate sampling distribution of any statistic without relying on parametric assumptions

**Q11: Explain the bias-variance trade-off and model complexity.**
- High bias (underfitting): model is too simple, misses underlying pattern in data
- High variance (overfitting): model is too complex, learns noise in training data, leads to poor generalization on unseen data
- Techniques to manage: cross-validation to detect overfitting, regularization to penalize complexity
- Find sweet spot where both bias and variance are minimized

**Q12: What is the difference between L1 and L2 regularization?**
- L1 (Lasso): adds absolute value of coefficients as penalty (lambda * sum of |wi|), can force some coefficients to zero, useful for feature selection
- L2 (Ridge): adds square of coefficients as penalty (lambda * sum of wi²), shrinks coefficients toward zero but rarely to zero, effective at handling multicollinearity
- Use L1 when feature selection is crucial, L2 when most features contribute meaningfully

**Q13: What is Simpson's paradox and dangers of aggregation?**
- Occurs when a trend appears in multiple subgroups but disappears or reverses when groups are combined
- Classic example: kidney stone treatment - Treatment A has higher success rate for both small and large stones separately, but appears less effective overall because it's disproportionately given to harder cases (large stones)
- Lurking variable: severity of the case
- Solution: always segment data and check for class imbalance before drawing conclusions from higher-level averages

**Q14: What is Berkson's paradox and selection bias?**
- Also known as collider bias - two independent variables appear negatively correlated when sampling is limited to a specific subset
- Example: hospital patients with COVID-19 seem less likely to be smokers because hospitalization is a collider (hospitalized for severe COVID-19 OR smoking-related illness)
- Solution: ensure sample is representative of general population, not just truncated subset

**Q15: What is imputation and the theory of missing data?**
- MCAR (missing completely at random): probability of missing is same for all observations - deleting rows is safe
- MAR (missing at random): probability of missingness related to observed data - use other variables to predict and impute missing values
- MNAR (missing not at random): probability of missingness depends on value of missing data itself (most dangerous, requires modeling or data collection changes)
- Criticize simple imputation (filling with mean) for reducing variance and distorting correlation - advocate for KNN or multiple imputation by chained equations

---

## Machine Learning Questions

**Q1: Why do we take the harmonic mean of precision and recall for F1 score?**
- Harmonic mean penalizes extreme values more than arithmetic mean
- Crucial when one metric is significantly lower than the other
- Precision and recall often have inverse relationship, so harmonic mean ensures equal weighting and balanced evaluation

**Q2: What is the purpose of activation functions in neural networks?**
- Introduce non-linearity to neural networks, allowing them to learn complex patterns and relationships in data
- Without activation functions, neural networks would reduce to linear models, limiting their ability to capture intricate features
- Popular: sigmoid, tanh, ReLU - each introducing non-linearity at different levels

**Q3: If you don't know whether data is scaled and have to work on classification without looking at data, which technique: random forest or logistic regression?**
- Random forest would be more suitable
- Logistic regression is sensitive to scale of input features - unscaled features can affect performance
- Random forest is less impacted by feature scaling due to ensemble nature - decision trees are built independently, scaling doesn't influence splitting decisions

**Q4: In binary classification for cancer identification, which metric to prioritize: precision or recall?**
- Recall is more critical than precision
- Maximizing recall ensures model correctly identifies as many positive cases as possible, reducing chances of false negatives
- False negative in cancer identification could have severe consequences
- While precision is important to minimize false positives, prioritizing recall ensures higher sensitivity to actual positive cases

**Q5: How does skewness in dataset distribution affect ML model performance?**
- Bias in model performance: skewed data can introduce bias, especially with algorithms sensitive to class distribution - models might be biased toward majority class
- Impact on algorithms: skewed data can affect decision boundaries - in logistic regression or SVMs, decision boundary might be biased toward dominant class
- Prediction errors: skewed data can result in inflated accuracy metrics - models might achieve higher accuracy by predicting majority class but fail to detect patterns in minority class

**Q6: Explain the difference between Lasso and Ridge regularization.**
- Both prevent overfitting by adding penalty terms to loss function
- Lasso (L1): adds absolute values of coefficients, encourages sparse feature selection, tends to drive some coefficients to exactly zero
- Ridge (L2): adds squared values of coefficients, discourages large coefficients but rarely leads to sparsity
- Choose Lasso when feature selection is crucial, Ridge when all features contribute meaningfully

**Q7: Explain Bayesian optimization in hyperparameter tuning vs grid/random search.**
- Bayesian optimization: iterative model-based technique using probabilistic models to guide search of optimal hyperparameters
- Unlike grid/random search, considers information gained from previous iterations, directing search toward promising regions of hyperparameter space
- More efficient, requiring fewer evaluations, suitable for complex and computationally expensive models

**Q8: What is the significance of out-of-bag (OOB) error?**
- Valuable metric in ensemble methods, particularly in bagging
- Measures model's performance on instances not included in bootstrap sampling during training
- Unbiased estimation of model generalization error, eliminating need for separate validation set
- Crucial for assessing ensemble performance and guiding hyperparameter tuning

**Q9: Explain the connection between bagging and no free lunch theorem.**
- No free lunch theorem: no single ML algorithm performs best across all possible datasets
- Bagging embraces diversity of models by creating multiple models using different subsets of data
- Practical implementation of no-free-lunch theorem - different subsets of data may require different models for optimal performance

**Q10: Explain the difference between hard and soft voting in boosting algorithms.**
- Hard voting: each model makes a prediction, final prediction determined by majority voting
- Soft voting: each model provides probability estimation for each class, final prediction based on average or weighted average of these probabilities
- Soft voting considers confidence of each model's prediction

**Q11: How does choice of weak learners (decision stumps, decision trees) affect voting/boosting performance?**
- Decision stumps (shallow trees with one split): computationally less expensive, prone to underfitting, suitable for boosting
- More complex weak learners like deeper trees may lead to overfitting and degrade model's generalization ability
- Balance between simplicity and complexity in weak learners is crucial for boosting performance

**Q12: Differentiate between feature selection and feature extraction.**
- Feature selection: using subset of most relevant features from original set - eliminates irrelevant/redundant features, reduces dimensionality, improves interpretability and efficiency
- Feature extraction: transforms original features into new set of features often of lower dimensionality (PCA, t-SNE) - captures essential information while discarding less relevant details
- Feature extraction useful when dealing with high dimensional data or when feature interpretation is less critical

**Q13: How can cross-validation help improve model performance?**
- Assesses and improves model performance by evaluating how well model generalizes to new data
- Involves splitting data into multiple subsets, training models on different folds, validating on remaining folds
- Process repeated multiple times, average performance computed
- Provides more robust estimation of performance, helps identify overfitting, guides hyperparameter tuning for better generalization

**Q14: Differentiate between feature scaling and feature normalization.**
- Feature scaling: general term for standardizing/transforming scale of features to consistent range - prevents features with large scales from dominating those with smaller scales during training
- Methods: min-max scaling, z-score standardization, robust scaling
- Feature normalization: transforms features to standard normal distribution with mean zero and standard deviation one - a type of feature scaling emphasizing achieving specific distribution

**Q15: Explain pruning during training vs pruning after training.**
- During training: trees grown to full depth, unnecessary branches pruned based on criteria (e.g., information gain) - prevents overfitting by removing branches capturing noise
- After training: tree allowed to grow without restrictions, then pruning applied - may involve removing nodes/branches that don't contribute significantly to prediction performance
- Pruning during training: reduces overfitting, more efficient training, but requires setting hyperparameters during training which may lead to underfitting
- Pruning after training: tree captures more details, may improve accuracy, but may also lead to overfitting

**Q16: What is grid search CV?**
- Grid search cross validation: hyperparameter tuning technique that systematically searches through predefined hyperparameter grid to find combination that yields best model performance
- Performs cross validation for each combination of hyperparameters, assessing model's performance on different subsets of training data
- Exhaustively tests all possible hyperparameter combinations

**Q17: What is false positive and false negative and how are they significant?**
- False positive: model predicts positive class incorrectly - incorrectly identifies instance as belonging to positive class when it belongs to negative class
- False negative: model predicts negative class incorrectly - fails to identify instance that belongs to positive class
- In medical diagnosis: false positive can lead to unnecessary treatment causing patient distress and additional costs
- In disease detection: false negative may result in undetected issues delaying necessary actions and potentially causing harm

**Q18: What is PCA in machine learning and can it be used for feature selection?**
- PCA: dimensionality reduction technique that transforms high dimensional data into lower dimensional space while retaining as much variance as possible
- Identifies principal components which are linear combination of original features
- Primarily used for dimensionality reduction, indirectly performs feature selection by highlighting most informative components
- Better choices for feature selection when interpretability of individual features is crucial

**Q19: Model has high bias and low variance. How to deal with it?**
- Increase model complexity: choose more complex model that can better capture underlying pattern (e.g., move from linear to non-linear)
- Feature engineering: introduce additional relevant features model may be missing
- Reduce regularization: reduce regularization parameters to allow model to fit training data more closely
- Ensemble methods: combine predictions from multiple models
- Hyperparameter tuning: experiment to find optimal settings

**Q20: What is the interpretation of ROC area under the curve (AUC)?**
- ROC curve: graphical representation of binary classification model's performance across different discrimination thresholds
- AUC = 1: perfect classifier with no false positives and false negatives
- AUC = 0.5: model performs no better than random chance
- AUC > 0.5: model performs better than random chance
- Higher AUC indicates better discrimination ability

---

## Deep Learning Questions

**Q1: What is the difference between traditional ML and deep learning?**
- Traditional ML: relies on manually engineered features, works well with structured data, requires domain expertise
- Deep learning: automatically learns hierarchical features from raw data, excels with unstructured data (images, text, audio), requires large datasets and computational resources

**Q2: What is the structure of a neural network?**
- Input layer: receives raw features
- Hidden layers: perform transformations and learn patterns
- Output layer: produces final predictions
- Connections between neurons have weights that are adjusted during training

**Q3: Explain forward and backward propagation.**
- Forward propagation: input data flows through network, each layer applies weights and activation functions to produce output
- Backward propagation: calculates gradients of loss function with respect to weights using chain rule, updates weights to minimize loss

**Q4: What is weight initialization and why is it important?**
- Xavier/He initialization: sets initial weights based on number of input/output neurons
- Important because poor initialization can lead to vanishing/exploding gradients, slow convergence, or getting stuck in poor local minima

**Q5: What are activation functions (sigmoid, tanh, ReLU) and the vanishing gradient problem?**
- Sigmoid: outputs between 0 and 1, gradients become very small for large positive/negative inputs (vanishing gradients)
- Tanh: outputs between -1 and 1, also suffers from vanishing gradients
- ReLU: outputs 0 for negative inputs, identity for positive inputs - helps mitigate vanishing gradients but can cause dead neurons

**Q6: What are RNN, LSTM, and GRU?**
- RNN: processes sequential data, but suffers from vanishing gradients and difficulty learning long-term dependencies
- LSTM: adds memory cells with input, forget, and output gates to selectively remember/forget information over long sequences
- GRU: simplified version of LSTM with update and reset gates, fewer parameters, faster training

**Q7: What are CNNs and how do they work?**
- CNNs use convolutional layers to automatically learn spatial hierarchies of features
- Convolution: applies learnable filters to input, detects local patterns
- Pooling: reduces spatial dimensions, provides translation invariance
- Fully connected layers: final classification

**Q8: What are 1x1 convolutions and their uses?**
- 1x1 convolutions: convolutions with 1x1 kernel size
- Used to reduce/increase number of channels (depth), add non-linearity, and reduce computational cost
- Can be used for dimensionality reduction while preserving spatial information

**Q9: Why do transformers need positional encoding?**
- Transformers process all tokens in parallel (efficient but no built-in notion of order)
- Without positional information, transformer would treat sequence as bag of tokens - wouldn't know difference between "dog bit man" and "man bit dog"
- Positional information added to token embeddings before entering transformer layer

**Q10: What is scaled dot-product attention?**
- Computes attention as softmax((Q * K^T) / sqrt(d_k)) * V
- Division by sqrt(d_k) (square root of key dimension) scales dot product back into reasonable range
- Prevents softmax saturation when dot products become large, keeps gradient healthy

**Q11: Why is multi-head attention better than single-head attention?**
- Single attention head can learn one kind of relationship between tokens
- Language contains many different kinds of relationships simultaneously (local grammatical, long-range semantic, positional, entity references)
- Multi-head attention projects input into multiple different subspaces, runs separate attention operations in parallel
- Each head specializes in different pattern - one learns short-range grammatical dependencies, another learns long-range semantic associations, etc.

**Q12: Why do transformers need positional encoding and what is the difference between sinusoidal and learned positional embeddings?**
- Transformers process all tokens in parallel, have no built-in notion of order
- Without positional information, transformer would treat sequence as bag of tokens
- Sinusoidal: fixed sine/cosine functions at different frequencies, parameter-free, generalizes to longer sequence lengths
- Learned: each position has trainable embedding vector, more flexible, often works very well when maximum sequence length is known and fixed during training

**Q13: What is the difference between pre-layer and post-layer normalization in transformers?**
- Post-layer: residual connection added first, then layer normalization applied
- Pre-layer: input normalized first before going into sublayer, then residual connection bypasses sublayer output
- Pre-layer normalization makes residual pathway cleaner, helps gradient move more reliably through network
- Makes training large language models more stable - most modern LLMs favor pre-layer normalization

---

## RAG Questions

**Q1: What is retrieval-augmented generation and why is it important?**
- RAG: architecture that connects language model to external knowledge base at generation time
- Instead of relying only on what model learned during training, system first retrieves relevant information from sources like documents, databases, or internal knowledge bases
- Then uses that material to generate answer
- Important because LLMs' built-in knowledge can be outdated, incomplete, or disconnected from private enterprise data
- RAG gives model access to fresh, domain-specific, and traceable information right when question is asked

**Q2: What are the two core components of RAG system?**
- Retriever: responsible for finding relevant information from external knowledge source (vector database, keyword index, search engine, hybrid stack)
- Generator: language model itself - uses retrieved context to produce final answer
- In simple terms: retriever finds the evidence, generator turns evidence into useful response

**Q3: Differentiate between sparse, dense, and hybrid retrieval.**
- Sparse retrieval: matches exact terms (BM25) - great when wording matters (product names, IDs, legal clauses, domain-specific keywords)
- Dense retrieval: converts query and document into embeddings, retrieves based on semantic similarity - better at understanding meaning even when exact words don't match
- Hybrid retrieval: combines both - uses sparse for lexical precision, dense for semantic recall - common enterprise pattern because real queries usually need both

**Q4: What are HNSW and IVF and their trade-offs?**
- HNSW (Hierarchical Navigable Small World): builds graph structure allowing system to navigate quickly toward nearby vectors - known for strong recall and low-latency retrieval
- Trade-off: can become memory-intensive and operationally expensive as index grows, updates can be harder to manage
- IVF (Inverted File): groups vectors into clusters and searches within most relevant ones instead of scanning whole space
- More scalable and often more storage efficient, but recall can drop if clustering not well tuned
- Decision: which one fits your latency, scale, memory, and update requirements

**Q5: What are parent document retrieval and sentence window retrieval?**
- Both handle chunking - if chunks too big, retrieval gets noisy; if too small, lose context
- Parent document retrieval: embed smaller child chunks for precise retrieval, then return larger parent section around match so model gets fuller context at generation time
- Sentence window retrieval: retrieves specific sentence, then expands context around it by pulling nearby sentences
- Useful when meaning depends on local context (resolving pronouns, references, tightly connected reasonings)

**Q6: What is lost in the middle problem?**
- Pattern where long context models often pay more attention to information at beginning or end of prompt than information buried in middle
- In RAG: can retrieve relevant documents, include in context window, still get weak answer if most important information ends up in wrong position
- Solutions: reranking (push most relevant chunks higher), context pruning (avoid flooding model), better context organization (place critical evidence where model likely to use it)

**Q7: How does HyDE improve zero-shot retrieval?**
- HyDE (Hypothetical Document Embeddings): user queries are often short, vague, underspecified; relevant documents are usually richer and more detailed
- Closes semantic gap by first asking LLM to generate hypothetical answer/document based on query
- Instead of retrieving with original short question, system embeds hypothetical document and uses it as search signal
- Generated text captures right vocabulary, concepts, semantic directions - acts as semantic bridge between user intent and real documents in database

**Q8: What pre-retrieval techniques are used to improve complex queries?**
- Query reformulation: rewrite vague/messy question into something more retrieval-friendly, may generate multiple query variants
- Context integration: use conversation history to resolve what vague references actually mean (e.g., "How does it compare to previous one?")
- Structured preprocessing: entity extraction, metadata filters, date constraints, keyword routing - narrows search space first
- Better queries usually lead to better retrieval, which leads to better answers

**Q9: What is the difference between standard RAG, corrective RAG, and self-RAG?**
- Standard RAG: basic pattern - retrieve documents, pass to model, generate answer
- Corrective RAG (CRAG): adds validation step after retrieval - evaluates whether results are good enough, if not triggers fallback (alternative retrieval, broader search, web search)
- Self-RAG: gives model more active role in evaluating usefulness of retrieved information and deciding whether to retrieve again, refine reasoning, revise output
- Progression: standard (retrieve once) → corrective (check retrieval quality) → self-RAG (adaptive and reflective during generation)

**Q10: What is agentic RAG?**
- Retrieval stops being fixed pipeline step, becomes part of larger decision-making loop
- Language model acts as orchestrator - can decide whether it needs retrieval, which tool to use, which source to query, whether results are sufficient
- More flexible for complex workflows involving multiple tools (vector search, SQL, web search, code execution)
- Upside: power; downside: complexity (latency, observability, control harder)
- Not just smarter version of RAG, different level of orchestration

**Q11: How does graph RAG differ from traditional vector RAG?**
- Traditional vector RAG: retrieve based on similarity between embeddings - works well but doesn't explicitly model relationships between entities, events, concepts
- Graph RAG: adds structure - turns information into graph where entities become nodes, relationships become edges
- Allows system to reason over connections, not just similarity
- Useful for multi-hop reasoning, relationship-heavy questions, broad sense-making tasks
- Not automatically better in every scenario, but when problem depends on linked entities, hierarchical summaries, or connected evidence, can offer major advantage

**Q12: Are long context models making RAG obsolete?**
- No. Long context is powerful but doesn't eliminate need for retrieval
- Long context great when you know exactly what information to include and amount is manageable
- But in real systems: enterprise knowledge changes constantly, documents can be massive, sending everything into prompt every time is expensive and slow
- RAG still valuable for: freshness, cost control, selective context construction, source traceability
- Best setup often uses both: retrieval finds right evidence, long context gives model room to reason over it

**Q13: How are RAG systems evaluated?**
- Two stages: retrieval evaluation and generation evaluation
- Retrieval: whether system pulls relevant context, whether important evidence is ranked high enough (precision, recall, ranking quality, whether context sufficient to answer)
- Generation: whether final answer is grounded in retrieved evidence, whether it's correct, whether it fully addresses user's intent
- Frameworks like RagEx provide automated metrics for faithfulness and answer quality
- Strong teams use both metrics and human review - point is not just to measure outputs, it's to diagnose where pipeline is failing

**Q14: How do you optimize RAG for both accuracy and latency?**
- Finding right trade-off across pipeline
- Retrieval efficiency: better indexing strategies, approximate nearest neighbor search, metadata filtering, candidate narrowing before expensive reranking
- Caching: semantic caching cuts latency for repeated/similar questions by avoiding redundant retrieval and generation
- Compress context before generation: use smaller model to summarize/filter retrieved documents so final generator only sees most useful evidence
- Pipeline design: cheap filtering early, expensive reasoning later, spend heavy compute only where it improves answer quality

**Q15: What are the biggest red flags in RAG system design?**
- Treating failures like magic: if someone says model is just hallucinating without diagnosing retrieval quality, chunking, ranking, grounding, or evaluation
- Designing only for demos: basic notebook pipeline might be enough for POC, but real production system needs access control, observability, source attribution, ingestion workflow, failure handling
- Ignoring evaluation: if someone can talk about embeddings and vector databases but cannot explain how to measure retrieval quality and answer faithfulness or regression over time
- Ignoring security and operational risk: need to consider prompt injection, stale indexes, bad data ingestion, permissions, monitoring

---

## Agentic AI Questions

**Q1: What is the difference between agentic AI and traditional AI?**
- Traditional AI: reactive - give input, get output, interaction ends there (e.g., ask LLM to summarize report, generates summary and stops, doesn't independently decide what to do next)
- Agentic AI: goal-oriented - instead of generating one response and ending, tries to complete task by breaking into smaller steps, deciding what information needed, calling tools, inspecting results, continuing until goal reached or stopping condition hit
- Distinction: traditional AI about response generation, agentic AI about task execution
- Agentic systems feel like digital workers - can take actions, interact with external systems, adapt step by step based on what happens

**Q2: Explain Andrew Ng's four agentic design patterns.**
- Reflection: model reviews and improves its own output (generate code first, critique, then produce stronger version) - built-in self-correction step
- Tool use: model can access external tools (web search, internal systems) - model doesn't inherently know current/private information, but tools give access
- Planning: model first creates sequence of steps before starting execution - useful for long/multi-stage tasks, adds structure and helps track progress
- Multi-agent collaboration: multiple specialized agents work together (one researches, another writes code, another reviews) - makes AI systems more reliable, structured, capable of solving complex tasks

**Q3: What is ReAct framework?**
- ReAct (Reason + Act): framework where system alternates between thinking about what to do and then actually doing it
- Cycle has three parts: Reasoning (model identifies what it needs next), Action (model chooses and calls tool), Observation (model reads tool result and updates next move)
- Reduces blind guessing - instead of jumping straight to answer, system gathers evidence step by step
- Introduces explicit intermediate stages between question and final answer - makes workflow more grounded, traceable, easier to debug
- Safer to describe as internal reasoning and action structure rather than saying model must expose full chain of thought

**Q4: What is the difference between system prompts and user prompts?**
- System prompt: defines high-level behavior of assistant - specifies identity, tone, constraints, allowed tools, safety rules, formatting requirements
- User prompt: task-specific instruction - tells system what user wants in that particular interaction
- Models trained to treat system prompts as high priority - system prompt acts as top instruction layer, user prompt works within it
- System prompt not perfect security boundary - helps guide behavior but not enough on its own to stop prompt injection or unsafe behavior
- Real security comes from full system architecture (tool restrictions, permissions check, input filtering, output validation, human approval)

**Q5: How is reflection technically implemented?**
- Implemented as loop between generation and critique
- First stage: model produces initial answer, draft, plan, or code snippet
- Instead of returning directly to user, system sends to review stage (same model with different prompt or separate critique model)
- Critique checks output against specific criteria (is SQL query correct? Is code efficient? Did answer miss important edge case? Does it follow required format?)
- Critique passed back to generator, generator produces revised version
- Cycle continues until output reaches acceptable quality, pass condition met, or maximum iterations reached
- Explicit feedback loop with defined quality checking stage before final output

**Q6: How do tool use and function calling work?**
- Tool use turns model from text generator into system that can interact with outside world
- Process: give model list of available tools, each described with structured schema (tool name, description, required arguments, expected parameter types)
- When user asks something, model first decides whether to answer directly or call tool
- If tool needed, model returns structured tool call instead of plain text response (e.g., "call weather API with city=Mumbai")
- Application layer executes tool (model itself does not run API or query database - surrounding software does)
- Result returned to model, model uses it to generate final answer
- Full cycle: user query → model selects tools → app executes tool → result returns → model answers

**Q7: How are agentic memory systems engineered?**
- Memory engineered because models have limited context windows, cannot remember everything forever
- Split into layers: working memory (recent conversations, current task state, recent tool output, plan agent is following - short-term context needed to continue current task)
- Long-term memory: stores information outside prompt window (user preferences, previous solutions, recurring workflows, business rules, summaries of older interactions)
- Common implementation: vector database where past information embedded and retrieved by similarity
- Also includes structured databases, key-value stores, summary documents, metadata layers
- Agent memory about state management plus retrieval strategy - store right information, retrieve at right time, avoid overwhelming model with irrelevant context

**Q8: Describe multi-agent orchestration and routing.**
- Useful when one agent not enough, or when specialization improves quality
- Instead of one general-purpose agent handling everything, system uses multiple specialized agents (research agent, SQL agent, coding agent, reviewer agent)
- Design question: who decides which agent handles which task - this is where orchestration and routing comes in
- Common setup: supervisor agent - receives user goal, breaks into subtasks, assigns each to most suitable specialist
- Routing methods: rule-based (fixed logic if-else), semantic (match request to agent whose domain most relevant), LLM-based (use model to decide which specialist should take task)
- Strength: modularity - each agent can be improved independently, replace one agent/change one prompt/update one tool stack without rebuilding whole system

**Q9: Compare LangChain, LangGraph, AutoGen, and CrewAI.**
- LangChain: broad application framework for building LLM-powered pipelines - helps with prompts, retrieval, chains, tools, output parsers, integration - often starting point for many LLM applications
- LangGraph: designed for stateful workflow with loops, branches, retries, and explicit control flow - if you want agent that can revisit steps, maintain state object, behave like graph instead of linear chains
- AutoGen: known for agent-to-agent interaction - specially useful when multi-agent needs to talk to each other, collaborate, sometimes execute in conversational style
- CrewAI: focuses on role-based team collaboration - define agents with roles, responsibilities, goals, framework coordinates them as team
- Selection logic: LangChain for general LLM app building, LangGraph for complex stateful workflows, AutoGen for conversational multi-agent systems, CrewAI for role-based collaborative agent teams

**Q10: What are evals in agentic AI?**
- Evals: testing and measurement layers for agent systems
- In traditional software, testing straightforward because outputs are deterministic
- In agentic systems, output may vary from run to run - evaluation cannot rely on exact text matching
- Evals measure multiple aspects: did agent choose correct tool? Did it pass right arguments? Did it follow intended workflow? Was final answer correct and grounded? Did it stay within policy and safety rules?
- Common method: LLM as a judge where another model scores output using rubric
- Strong evaluation systems combine with deterministic checks: schema validation, rule-based assertions, unit tests for tools, tool success rates, latency, cost tracking
- Evals not just about whether answer sounded good - about measuring end-to-end task quality, decision quality, overall system reliability

**Q11: Explain tracing, spans, and observability.**
- Observability: lets us understand what agent actually did during execution
- Span: one individual unit of work (one LLM call, one database query, one retriever step, one API call)
- Trace: full sequence or tree of spans for request - shows entire execution path from start to finish
- Incredibly useful because agentic systems are multi-step - if something goes wrong, need to know which step failed, what prompt led to wrong output, whether issue came from retrieval/tool use/reasoning, how much latency each step introduced, where token usage increased
- Without observability, debugging agents becomes guesswork - with observability, can inspect workflow like timeline or graph
- Makes agent system debuggable, measurable, and production ready

**Q12: What is the difference between text hallucination and functional hallucinations?**
- Text hallucination: model says something incorrect in natural language - may give wrong date, invent fact, misstate title
- Functional hallucination: more dangerous - model produces incorrect action or invalid system instruction (invent tool name, use parameter that doesn't exist, produce malformed JSON, call wrong API endpoint, attempt action that should never be executed)
- Text hallucination affects information quality, functional hallucination affects execution safety
- Mitigation for functional hallucination much stronger: strict schema validation, tool parameter checks, sandboxing, policy layers, human approval for higher risk actions

**Q13: How do you handle non-deterministic behavior?**
- Agentic systems are probabilistic - same input may not always produce exactly same result
- Cannot eliminate fully but can reduce and manage
- Lower temperature: makes output more stable and less random (temperature zero improves consistency but doesn't guarantee perfect determinism)
- Enforce structured outputs: model must respond in schema or JSON format instead of unrestricted free text
- Use validation rules, retries, fallbacks, repeated benchmark runs, semantic scoring instead of exact match scoring, dataset-based evaluations
- Agent engineering not about forcing model to behave like traditional deterministic code - about designing system that performs reliably even though model itself is probabilistic

**Q14: What are the risks of infinite loops and agent sprawl?**
- Infinite loops: agent keeps repeating steps without making real progress (keep rethinking same problem, repeatedly calling same tool, two agents pass task back and forth endlessly)
- Dangerous because increases latency, cost, failure risk
- Protection: max iteration limits, timeout limits, duplicate action detection, progress checks, explicit success/failure stopping rules
- Agent sprawl: broader organizational issue - many agents deployed across company without enough governance
- Over time, teams lose track of who owns agent, what permissions it has, what tools it can access, which version in production, whether still safe and useful
- Infinite loops mainly execution problem, agent sprawl governance and management problem
- Mature organization addresses both through strong technical control and centralized oversight

**Q15: What are the main security and deployment challenges?**
- Biggest security challenge: agent not just generating text - may be connected to tools, databases, APIs, code execution environments, business systems
- Failures can have real-world consequences
- Major risks: prompt injection, sensitive data leakage, over-permissioned tools, insecure code execution, malicious inputs, cross-system privilege escalation
- Example: if agent has access to email, internal documents, databases, one unsafe action could expose sensitive information or trigger unintended operations
- Production deployment requires strong controls: least privilege access, sandbox execution, audit logging, secret management, approval workflows, output filtering, human review for destructive or high-risk actions
- More capable agent becomes, more important governance, access control, and safety architecture becomes
