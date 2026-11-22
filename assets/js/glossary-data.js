/* Glossary terms. Each entry: [term, module, section anchor, definition]. Definitions follow course conventions.
   Add a module's terms when its notes are built; the anchor must match an <h2 id> in src/module-N.html. */
(function(root){
root.GLOSSARY=[
['Population',1,'population','The complete collection of all measurements or data being considered. It is generally never fully observed.'],
['Sample',1,'population','A subset of the population, usually a small percentage of it, that we actually observe.'],
['Variable',1,'population','Any characteristic of an individual that is of interest; it varies from subject to subject.'],
['Categorical variable',1,'population','A variable whose observations belong to one of several groups. Nominal groups have no order (blood type); ordinal groups have a natural order (education level).'],
['Nominal',1,'population','A categorical variable whose groups have no natural order, such as blood type or eye color.'],
['Ordinal',1,'population','A categorical variable whose groups have a natural order, such as socioeconomic status (low, medium, high).'],
['Quantitative variable',1,'population','A variable whose observations are numbers for which arithmetic makes sense. It can be discrete or continuous.'],
['Discrete variable',1,'population','A quantitative variable that takes only certain fixed values with nothing in between, such as a count.'],
['Continuous variable',1,'population','A quantitative variable that can take infinitely many values between any two points, such as height or weight.'],
['Simple random sample (SRS)',1,'sampling','A sample chosen so that every possible sample of the given size has the same chance of being selected.'],
['Systematic sampling',1,'sampling','Choose a random starting point between 1 and k, then include every kth subject after it.'],
['Stratified sampling',1,'sampling','Divide the population into homogeneous groups (strata), then take a simple random sample within each stratum.'],
['Cluster sampling',1,'sampling','Divide the population into heterogeneous groups (clusters) that each resemble the population, randomly select clusters, and include everyone in them.'],
['Distribution',1,'distribution','How often (frequency) or what fraction of the time (relative frequency) a variable takes each value. Describe it by shape, center, spread, and outliers.'],
['Relative frequency',1,'distribution','A frequency divided by the total number of observations, written as a proportion or a percentage.'],
['Histogram',1,'distribution','A bar graph of binned quantitative data; each bar’s height is the frequency (or relative frequency) of values in that bin.'],
['Skewness',1,'distribution','Lack of symmetry. A distribution is skewed right (positive skew) when its right tail is longer, and skewed left when its left tail is longer.'],
['Sample mean',1,'location','x̄ = (x₁ + x₂ + ⋯ + xₙ)/n, the arithmetic average of the observations.'],
['Sample median',1,'location','x̃, the middle observation of the sorted data: the ((n+1)/2)th value for odd n, or the average of the two middle values for even n.'],
['Mode',1,'location','The observation (or observations) that occurs most frequently in the data.'],
['Resistant measure',1,'location','A summary that extreme values barely change. The median and IQR are resistant; the mean and standard deviation are not.'],
['Percentile',1,'quartiles','The pth percentile is a value with about p × 100% of the data below it and about (1 − p) × 100% above it.'],
['Quartiles',1,'quartiles','Q₁ (25th percentile), Q₂ (the median), and Q₃ (75th percentile). Our convention: Q₁ and Q₃ are the medians of the lower and upper halves, leaving the median out when n is odd.'],
['Five-number summary',1,'quartiles','Min, Q₁, median, Q₃, max. A boxplot graphs it.'],
['Boxplot',1,'quartiles','A graph of the five-number summary: a box from Q₁ to Q₃ with a line at the median, whiskers to the most extreme non-outliers, and outliers plotted separately.'],
['Deviation from the mean',1,'variability','xᵢ − x̄. The deviations always add to zero.'],
['Interquartile range (IQR)',1,'variability','IQR = Q₃ − Q₁, the range of the middle 50% of the data. The textbook calls it the fourth spread, fₛ.'],
['Sample variance',1,'variability','s² = Sₓₓ/(n − 1), where Sₓₓ = Σ(xᵢ − x̄)² = Σxᵢ² − (Σxᵢ)²/n. The n − 1 reflects the degree of freedom lost by estimating x̄.'],
['Sample standard deviation',1,'variability','s = √s², a typical distance of the observations from the mean, in the original units. s = 0 only when all observations are equal.'],
['Outlier',1,'outliers','A value far outside the overall pattern. Rule of thumb: below Q₁ − 1.5 × IQR or above Q₃ + 1.5 × IQR. Beyond 3 × IQR it is an extreme outlier.']
];
})(typeof window!=='undefined'?window:globalThis);
